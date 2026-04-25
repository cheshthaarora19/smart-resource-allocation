const IssueReport = require('../models/IssueReport');

// Check if a similar report exists within 1km radius in last 24 hours
const checkDuplicate = async (lat, lng, need_type) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get recent reports of same type
  const recentReports = await IssueReport.find({
    need_type,
    createdAt: { $gte: oneDayAgo },
    is_duplicate: false
  });

  for (const report of recentReports) {
    const distance = getDistanceKm(
      lat, lng,
      report.location.lat, report.location.lng
    );

    // If within 1km, it's a duplicate
    if (distance <= 1.0) {
      return { isDuplicate: true, originalReport: report };
    }
  }

  return { isDuplicate: false, originalReport: null };
};

// Haversine formula to calculate distance between 2 coords in km
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

module.exports = { checkDuplicate };