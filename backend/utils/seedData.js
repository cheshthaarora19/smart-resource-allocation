const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const IssueReport = require('../models/IssueReport');
const User = require('../models/User');
const PriorityScore = require('../models/PriorityScore');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB');

    // Create a dummy user for reports
    let user = await User.findOne({ email: 'seed@test.com' });
    if (!user) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user = await User.create({
        name: 'Seed User',
        email: 'seed@test.com',
        password: await bcrypt.hash('123456', salt),
        role: 'citizen'
      });
    }

    // Historical reports for last 30 days
    const regions = [
      { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      { name: 'Pune', lat: 18.5204, lng: 73.8567 }
    ];

    const needTypes = ['food', 'health', 'education', 'disaster'];

    const reports = [];

    for (let i = 0; i < 50; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const need_type = needTypes[Math.floor(Math.random() * needTypes.length)];
      const severity = Math.floor(Math.random() * 10) + 1;
      const people_affected = Math.floor(Math.random() * 500) + 10;
      const daysAgo = Math.floor(Math.random() * 30);

      const report = await IssueReport.create({
        reported_by: user._id,
        title: `${need_type} issue in ${region.name}`,
        description: `Urgent ${need_type} problem reported in ${region.name} area`,
        need_type,
        location: {
          lat: region.lat + (Math.random() * 0.1 - 0.05),
          lng: region.lng + (Math.random() * 0.1 - 0.05),
          address: region.name
        },
        severity,
        people_affected,
        status: Math.random() > 0.4 ? 'resolved' : 'pending',
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });

      // Create priority score for each report
      const raw = (severity * people_affected) / 1;
      const priority_score = Math.min(Math.round(raw), 1000);
      let urgency_level;
      if (priority_score >= 500) urgency_level = 'critical';
      else if (priority_score >= 200) urgency_level = 'high';
      else if (priority_score >= 50) urgency_level = 'medium';
      else urgency_level = 'low';

      await PriorityScore.create({
        report_id: report._id,
        priority_score,
        urgency_level,
        explanation: `Seeded data - severity ${severity}, people affected ${people_affected}`
      });

      reports.push(report);
    }

    console.log(`✅ Seeded ${reports.length} reports`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();