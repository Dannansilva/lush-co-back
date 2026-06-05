const { validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const StaffMember = require('../models/StaffMember');
const ErrorResponse = require('../utils/ErrorResponse');

// Robust helper to normalize date to start of UTC day without timezone offsets
const getStartOfDayUTC = (dateStr) => {
  if (dateStr && typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }
  
  const date = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(date.getTime())) {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
  }
  
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
};

// @desc    Get attendance records for a date
// @route   GET /api/attendance
// @access  Private (OWNER and RECEPTIONIST)
exports.getAttendance = async (req, res, next) => {
  try {
    const dateQuery = req.query.date;
    const targetDate = getStartOfDayUTC(dateQuery);
    
    // Find all attendance records for this date
    const attendanceRecords = await Attendance.find({ date: targetDate });

    // Get all staff members
    const allStaff = await StaffMember.find().sort({ name: 1 });

    // Format response: combine attendance record if it exists, otherwise return staff with null status
    const data = allStaff.map(staff => {
      const record = attendanceRecords.find(
        r => r.staffMember && r.staffMember.toString() === staff._id.toString()
      );
      
      return {
        staffMember: {
          _id: staff._id,
          name: staff.name,
          phoneNumber: staff.phoneNumber
        },
        status: record ? record.status : null,
        markedBy: record ? record.markedBy : null,
        checkInTime: record ? record.checkInTime : null,
        checkOutTime: record ? record.checkOutTime : null,
        updatedAt: record ? record.createdAt : null
      };
    });

    res.status(200).json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance (bulk)
// @route   POST /api/attendance
// @access  Private (OWNER and RECEPTIONIST)
exports.markAttendance = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { date, records } = req.body;
  const targetDate = getStartOfDayUTC(date);
  const userId = req.user.id;

  try {
    // 1. Validate Double-Click Lock Protection (30 minutes)
    for (const record of records) {
      const existingRecord = await Attendance.findOne({ 
        staffMember: record.staffMember, 
        date: targetDate 
      });

      if (existingRecord) {
        let lastActionTime = null;
        let actionName = '';

        if (record.status === 'PRESENT' && existingRecord.status === 'PRESENT') {
          if (existingRecord.checkOutTime === null) {
            // Trying to Clock Out
            lastActionTime = existingRecord.checkInTime;
            actionName = 'clocking in';
          } else {
            // Trying to Undo Clock Out
            lastActionTime = existingRecord.checkOutTime;
            actionName = 'clocking out';
          }
        } else if (record.status === 'ABSENT' && existingRecord.status === 'PRESENT') {
          // Trying to mark ABSENT (Reset)
          lastActionTime = existingRecord.checkOutTime || existingRecord.checkInTime;
          actionName = 'clocking in/out';
        }

        if (lastActionTime) {
          const elapsed = Date.now() - new Date(lastActionTime).getTime();
          const lockDuration = 30 * 60 * 1000; // 30 minutes
          if (elapsed < lockDuration) {
            const minutesLeft = Math.ceil((lockDuration - elapsed) / 1000 / 60);
            return res.status(400).json({
              success: false,
              message: `Double-click protection: button is locked for ${minutesLeft} more minutes.`
            });
          }
        }
      }
    }

    // 2. Perform Attendance Upserts
    const upsertPromises = records.map(async (record) => {
      // Check if staff member exists
      const staffExists = await StaffMember.findById(record.staffMember);
      if (!staffExists) {
        return null;
      }

      // Find existing attendance
      const existingRecord = await Attendance.findOne({ 
        staffMember: record.staffMember, 
        date: targetDate 
      });

      const updateFields = {
        status: record.status,
        markedBy: userId,
        createdAt: Date.now()
      };

      if (record.status === 'PRESENT') {
        if (!existingRecord || existingRecord.status !== 'PRESENT') {
          // Check In
          updateFields.checkInTime = Date.now();
          updateFields.checkOutTime = null;
        } else {
          // If already PRESENT, toggles checkOutTime
          updateFields.checkInTime = existingRecord.checkInTime;
          if (existingRecord.checkOutTime === null) {
            // Check Out
            updateFields.checkOutTime = Date.now();
          } else {
            // Undo Check Out (Reset to Checked In state)
            updateFields.checkOutTime = null;
          }
        }
      } else {
        // Clear both when marked ABSENT
        updateFields.checkInTime = null;
        updateFields.checkOutTime = null;
      }

      return Attendance.findOneAndUpdate(
        { staffMember: record.staffMember, date: targetDate },
        updateFields,
        { upsert: true, new: true, runValidators: true }
      );
    });

    const results = await Promise.all(upsertPromises);
    const successfulRecords = results.filter(r => r !== null);

    res.status(200).json({
      success: true,
      message: `Successfully marked attendance for ${successfulRecords.length} staff members`,
      date: targetDate.toISOString().split('T')[0],
      count: successfulRecords.length,
      data: successfulRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history for a staff member (Monday to Sunday of the week)
// @route   GET /api/attendance/history
// @access  Private (OWNER and RECEPTIONIST)
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const { staffMember, date } = req.query;
    if (!staffMember) {
      return res.status(400).json({
        success: false,
        message: 'Staff member ID is required'
      });
    }

    // Connect to staff member and check if exists
    const staff = await StaffMember.findById(staffMember);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Normalize input reference date or default to today's date
    const refDate = getStartOfDayUTC(date);
    
    // Find the Monday of the week containing refDate
    // In UTC: getUTCDay() yields 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const day = refDate.getUTCDay();
    const shift = day === 0 ? -6 : 1 - day;
    const mondayDate = new Date(refDate);
    mondayDate.setUTCDate(refDate.getUTCDate() + shift);

    // Generate date range from Monday to Sunday (exactly 7 days)
    const historyData = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(mondayDate);
      currentDate.setUTCDate(mondayDate.getUTCDate() + i);
      const targetDate = getStartOfDayUTC(currentDate);
      
      const record = await Attendance.findOne({
        staffMember,
        date: targetDate
      });
      
      historyData.push({
        date: targetDate.toISOString().split('T')[0],
        status: record ? record.status : null,
        checkInTime: record ? record.checkInTime : null,
        checkOutTime: record ? record.checkOutTime : null,
        markedBy: record ? record.markedBy : null,
        updatedAt: record ? record.createdAt : null
      });
    }

    res.status(200).json({
      success: true,
      staffMember: {
        _id: staff._id,
        name: staff.name,
        phoneNumber: staff.phoneNumber
      },
      data: historyData
    });
  } catch (error) {
    next(error);
  }
};
