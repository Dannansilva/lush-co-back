const webpush = require('web-push');
const Subscription = require('../models/Subscription');
const Attendance = require('../models/Attendance');

// Configure web-push details
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:ownerlushco@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('Web-push configured successfully with VAPID keys.');
} else {
  console.warn('Web-push warning: VAPID keys are missing from environment variables.');
}

// Time helper: Get current date/time adjusted to Asia/Colombo (UTC+5:30)
const getColomboTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const colombo = new Date(utc + (3600000 * 5.5)); // UTC + 5:30
  return colombo;
};

// Task 1: Send Push Reminders at 8:45 PM
const runNotificationJob = async () => {
  console.log('[Scheduler] Starting 8:45 PM Attendance Push Notification Job...');
  try {
    const subscriptions = await Subscription.find({});
    console.log(`[Scheduler] Found ${subscriptions.length} push subscriptions.`);

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title: 'Lush & Co Attendance Reminder',
      body: "Don't forget to clock out before going home! 💇‍♀️✨",
      vibrate: [200, 100, 200]
    });

    let successCount = 0;
    let failureCount = 0;

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        successCount++;
      } catch (err) {
        failureCount++;
        console.error(`[Scheduler] Failed to send push to subscription ${sub._id}:`, err.message);
        
        // Clean up invalid/expired subscriptions (410 Gone or 404 Not Found)
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`[Scheduler] Cleaning up expired subscription ${sub._id}`);
          await Subscription.deleteOne({ _id: sub._id });
        }
      }
    });

    await Promise.all(sendPromises);
    console.log(`[Scheduler] Push Notifications job completed. Success: ${successCount}, Failed/Cleaned: ${failureCount}`);
  } catch (err) {
    console.error('[Scheduler] Error running notifications job:', err);
  }
};

// Task 2: End of Day Automatic Attendance Clock-Out at 11:59 PM
const runClockoutJob = async () => {
  console.log('[Scheduler] Starting 11:59 PM End-of-Day Automatic Attendance Clock-out Job...');
  try {
    const colomboTime = getColomboTime();
    
    // Normalize to Colombo start of day in UTC format
    const todayUTC = new Date(Date.UTC(colomboTime.getFullYear(), colomboTime.getMonth(), colomboTime.getDate(), 0, 0, 0, 0));
    
    // Find all attendance records marked PRESENT for today that have no checkOutTime
    const openRecords = await Attendance.find({
      date: todayUTC,
      status: 'PRESENT',
      checkOutTime: null
    });

    console.log(`[Scheduler] Found ${openRecords.length} open attendance records to close today.`);

    let updatedCount = 0;

    for (const record of openRecords) {
      // Default checkout time: 9:00 PM (21:00) Colombo time = 15:30 UTC
      let recordCheckOut = new Date(Date.UTC(colomboTime.getFullYear(), colomboTime.getMonth(), colomboTime.getDate(), 15, 30, 0, 0));
      
      // If check-in happened after 9:00 PM, set checkout time to 11:59 PM Colombo time = 18:29 UTC
      if (record.checkInTime && new Date(record.checkInTime).getTime() >= recordCheckOut.getTime()) {
        recordCheckOut = new Date(Date.UTC(colomboTime.getFullYear(), colomboTime.getMonth(), colomboTime.getDate(), 18, 29, 0, 0));
      }

      record.checkOutTime = recordCheckOut;
      await record.save();
      updatedCount++;
    }

    console.log(`[Scheduler] Automatic clock-out completed. Closed ${updatedCount} records.`);
  } catch (err) {
    console.error('[Scheduler] Error running automatic clock-out job:', err);
  }
};

// Start background scheduler checks (run once every minute)
const startScheduler = () => {
  console.log('[Scheduler] Background attendance scheduler started.');
  
  let lastNotificationDateStr = '';
  let lastClockoutDateStr = '';

  setInterval(async () => {
    try {
      const colomboTime = getColomboTime();
      const hours = colomboTime.getHours();
      const minutes = colomboTime.getMinutes();
      const dateStr = colomboTime.toDateString();

      // Trigger 8:45 PM notification
      if (hours === 20 && minutes === 45 && lastNotificationDateStr !== dateStr) {
        lastNotificationDateStr = dateStr;
        await runNotificationJob();
      }

      // Trigger 11:59 PM automatic clock-out
      if (hours === 23 && minutes === 59 && lastClockoutDateStr !== dateStr) {
        lastClockoutDateStr = dateStr;
        await runClockoutJob();
      }
    } catch (err) {
      console.error('[Scheduler] Error in interval check:', err);
    }
  }, 60000); // Check every minute
};

module.exports = {
  startScheduler,
  runNotificationJob,
  runClockoutJob
};
