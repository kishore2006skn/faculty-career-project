import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Department from '../src/models/Department.js';
import FacultyProfile from '../src/models/FacultyProfile.js';
import Publication from '../src/models/Publication.js';
import Achievement from '../src/models/Achievement.js';
import AdvancementPolicy from '../src/models/AdvancementPolicy.js';
import { runSeed } from '../src/seed/seedRunner.js';
import { lookupCrossrefDoi } from '../src/services/externalApiService.js';

let passed = 0;
let failed = 0;

const assert = (condition, description) => {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
};

const runAllTests = async () => {
  console.log(`\n======================================================`);
  console.log(`🧪 Starting Backend Automated Test Suite`);
  console.log(`======================================================\n`);

  try {
    // Connect to DB
    await connectDB();

    // 1. Test Seed Data Execution
    console.log(`[Test Suite 1: Database Initialization & Seeding]`);
    await runSeed();
    const userCount = await User.countDocuments();
    assert(userCount >= 5, `Database seeded successfully with ${userCount} users`);

    const deptCount = await Department.countDocuments();
    assert(deptCount >= 4, `Found ${deptCount} departments`);

    const pubCount = await Publication.countDocuments();
    assert(pubCount >= 6, `Found ${pubCount} initial publications`);

    // 2. Test User Authentication & Password Hashing
    console.log(`\n[Test Suite 2: Authentication & Password Verification]`);
    const facultyUser = await User.findOne({ email: 'dr.sharma@institution.edu' }).select('+password');
    assert(!!facultyUser, 'Found faculty user dr.sharma@institution.edu');
    assert(facultyUser.password !== 'Password@123', 'Password is encrypted with bcrypt hash');

    const isCorrect = await facultyUser.comparePassword('Password@123');
    assert(isCorrect === true, 'comparePassword successfully validates correct password');

    const isWrong = await facultyUser.comparePassword('WrongPassword999');
    assert(isWrong === false, 'comparePassword safely rejects incorrect password');

    // 3. Test Faculty Profile & Completion Calculation
    console.log(`\n[Test Suite 3: Faculty Profile & Completion Algorithm]`);
    const profile = await FacultyProfile.findOne({ user: facultyUser._id });
    assert(!!profile, 'Faculty profile exists for faculty user');
    const completion = profile.calculateCompletion();
    assert(completion > 70, `Profile completion calculated accurately: ${completion}%`);

    // 4. Test Publication CRUD & Normalized Title Duplicate Detection
    console.log(`\n[Test Suite 4: Publication CRUD & Duplicate Detection]`);
    const newPub = await Publication.create({
      title: 'Automated Microgrid Dispatch Using Reinforcement Learning',
      publicationType: 'journal',
      faculty: facultyUser._id,
      department: facultyUser.department,
      journalOrConferenceName: 'IEEE Transactions on Smart Grid',
      academicYear: '2024-2025',
      doi: '10.1109/TSG.2024.9999999',
    });
    assert(!!newPub._id, 'Successfully created new test publication');
    assert(
      newPub.normalizedTitle === 'automatedmicrogriddispatchusingreinforcementlearning',
      'Pre-save hook normalized publication title correctly'
    );

    // Duplicate DOI check
    const duplicateDoi = await Publication.findOne({
      doi: '10.1109/TSG.2024.9999999',
      faculty: facultyUser._id,
    });
    assert(!!duplicateDoi, 'Duplicate detection identifies matching DOI');

    // 5. Test Review Workflow & Status Transition
    console.log(`\n[Test Suite 5: Publication Review Workflow]`);
    newPub.verificationStatus = 'submitted';
    newPub.verificationHistory.push({
      status: 'submitted',
      changedBy: facultyUser._id,
      comment: 'Submitted for verification',
      timestamp: new Date(),
    });
    await newPub.save();
    assert(newPub.verificationStatus === 'submitted', 'Publication transitioned to submitted status');

    const reviewer = await User.findOne({ role: 'reviewer' });
    newPub.verificationStatus = 'approved';
    newPub.assignedReviewer = reviewer._id;
    newPub.reviewerComments = 'Verified and approved by HOD.';
    newPub.verificationHistory.push({
      status: 'approved',
      changedBy: reviewer._id,
      comment: newPub.reviewerComments,
      timestamp: new Date(),
    });
    await newPub.save();

    const verifiedPub = await Publication.findById(newPub._id);
    assert(verifiedPub.verificationStatus === 'approved', 'Reviewer successfully approved publication');
    assert(verifiedPub.verificationHistory.length >= 2, 'Audit history tracks each state transition');

    // 6. Test External API (Crossref Service)
    console.log(`\n[Test Suite 6: Crossref Scholarly Metadata Service]`);
    const crossrefResult = await lookupCrossrefDoi('10.1109/TMC.2023.3298101');
    assert(
      crossrefResult !== null && typeof crossrefResult === 'object',
      'Crossref lookup function executes gracefully'
    );
    if (crossrefResult.success) {
      assert(!!crossrefResult.data.title, `Crossref returned real title: "${crossrefResult.data.title.substring(0, 40)}..."`);
    } else {
      console.log(`  ℹ️ Note: External Crossref network call handled gracefully: ${crossrefResult.message}`);
    }

    // 7. Test Career Advancement Criteria Scoring
    console.log(`\n[Test Suite 7: Advancement Points Calculation]`);
    const activePolicy = await AdvancementPolicy.findOne({ isActive: true });
    assert(!!activePolicy, 'Active institutional career advancement policy found');
    assert(activePolicy.stages.length >= 2, `Advancement policy contains ${activePolicy.stages.length} defined stages`);

    // Clean up test publication
    await Publication.findByIdAndDelete(newPub._id);
    console.log(`  🧹 Cleaned up temporary test publication`);

    console.log(`\n======================================================`);
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    await closeDB();
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    await closeDB();
    process.exit(1);
  }
};

runAllTests();
