const IssueReport = require('../models/IssueReport');
const VolunteerProfile = require('../models/VolunteerProfile');

const getSummaryAnalytics = async (region = null, days = 7) => {
  try {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let filter = { createdAt: { $gte: dateFrom } };
    if (region) filter['location.address'] = new RegExp(region, 'i');

    const totalReports = await IssueReport.countDocuments(filter);
    const resolvedReports = await IssueReport.countDocuments({ ...filter, status: 'resolved' });
    const pendingReports = await IssueReport.countDocuments({ ...filter, status: 'pending' });

    // Reports by need type
    const byNeedType = await IssueReport.aggregate([
      { $match: filter },
      { $group: { _id: '$need_type', count: { $sum: 1 } } }
    ]);

    // Reports by region
    const byRegion = await IssueReport.aggregate([
      { $match: { createdAt: { $gte: dateFrom } } },
      { $group: { _id: '$location.address', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Daily report trend
    const dailyTrend = await IssueReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most affected regions (by people_affected)
    const mostAffected = await IssueReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$location.address',
          total_people_affected: { $sum: '$people_affected' },
          report_count: { $sum: 1 }
        }
      },
      { $sort: { total_people_affected: -1 } },
      { $limit: 5 }
    ]);

    const resolutionRate = totalReports > 0
      ? Math.round((resolvedReports / totalReports) * 100)
      : 0;

    return {
      summary: {
        total_reports: totalReports,
        resolved_reports: resolvedReports,
        pending_reports: pendingReports,
        resolution_rate: `${resolutionRate}%`,
        period_days: days
      },
      by_need_type: byNeedType,
      by_region: byRegion,
      daily_trend: dailyTrend,
      most_affected_regions: mostAffected
    };

  } catch (error) {
    throw new Error(error.message);
  }
};

const getVolunteerAnalytics = async () => {
  try {
    const totalVolunteers = await VolunteerProfile.countDocuments();
    const availableVolunteers = await VolunteerProfile.countDocuments({ availability: 'available' });
    const busyVolunteers = await VolunteerProfile.countDocuments({ availability: 'busy' });

    const topVolunteers = await VolunteerProfile.find()
      .populate('user_id', 'name email')
      .sort({ tasks_completed: -1 })
      .limit(5);

    return {
      total_volunteers: totalVolunteers,
      available: availableVolunteers,
      busy: busyVolunteers,
      top_volunteers: topVolunteers
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { getSummaryAnalytics, getVolunteerAnalytics };