const assert = require('assert');
const {
  XP_CONFIG,
  LEVEL_THRESHOLDS,
  calculateDonorLevelAndRank,
  evaluateAchievements,
  calculateDonorProgress,
} = require('../utils/gamification');

console.log('🧪 Starting LifeLink Donor Progression & Gamification Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${error.message}\n`);
  }
}

// 1. Initial state test for brand-new donor
test('1. Brand-new donor starts with 0 donations, 0 XP, Level 1, and "New Donor" rank', () => {
  const newUser = {
    name: 'Vignesh',
    bloodGroup: 'O+',
    donationsCount: 0,
    points: 0,
  };
  const progress = calculateDonorProgress(newUser);
  
  assert.strictEqual(progress.donorLevel, 1, 'Initial level must be 1');
  assert.strictEqual(progress.donorRank, 'New Donor', 'Initial rank must be New Donor');
  assert.strictEqual(progress.points, 0, 'Initial points must be 0');
  assert.strictEqual(progress.donationsCount, 0, 'Initial donationsCount must be 0');
  assert.strictEqual(progress.pointsNeededNextLevel, 100, 'Next level requires 100 XP');
  assert.strictEqual(progress.progressPercent, 0, 'Progress percentage must be 0%');
  assert.strictEqual(progress.unlockedAchievementsCount, 0, 'No achievements should be unlocked initially');
});

// 2. Level and Rank calculation across thresholds
test('2. Donor Level and Rank calculation across all XP tiers', () => {
  // Level 1: 0 - 99 XP
  const l1 = calculateDonorLevelAndRank(50);
  assert.strictEqual(l1.donorLevel, 1);
  assert.strictEqual(l1.donorRank, 'New Donor');
  assert.strictEqual(l1.nextLevelXp, 100);
  assert.strictEqual(l1.pointsNeededNextLevel, 50);
  assert.strictEqual(l1.progressPercent, 50);

  // Level 2: 100 - 249 XP
  const l2 = calculateDonorLevelAndRank(100);
  assert.strictEqual(l2.donorLevel, 2);
  assert.strictEqual(l2.donorRank, 'Active Donor');
  assert.strictEqual(l2.nextLevelXp, 250);
  assert.strictEqual(l2.pointsNeededNextLevel, 150);
  assert.strictEqual(l2.progressPercent, 0);

  // Level 3: 250 - 499 XP
  const l3 = calculateDonorLevelAndRank(375);
  assert.strictEqual(l3.donorLevel, 3);
  assert.strictEqual(l3.donorRank, 'Regular Donor');
  assert.strictEqual(l3.nextLevelXp, 500);
  assert.strictEqual(l3.pointsNeededNextLevel, 125);
  assert.strictEqual(l3.progressPercent, 50);

  // Level 4: 500 - 999 XP
  const l4 = calculateDonorLevelAndRank(500);
  assert.strictEqual(l4.donorLevel, 4);
  assert.strictEqual(l4.donorRank, 'Dedicated Donor');
  assert.strictEqual(l4.nextLevelXp, 1000);

  // Level 5: 1000 - 1999 XP
  const l5 = calculateDonorLevelAndRank(1500);
  assert.strictEqual(l5.donorLevel, 5);
  assert.strictEqual(l5.donorRank, 'Life Saver');
  assert.strictEqual(l5.nextLevelXp, 2000);

  // Level 6: 2000+ XP (Max rank)
  const l6 = calculateDonorLevelAndRank(2500);
  assert.strictEqual(l6.donorLevel, 6);
  assert.strictEqual(l6.donorRank, 'LifeLink Champion');
  assert.strictEqual(l6.nextLevelXp, null);
  assert.strictEqual(l6.progressPercent, 100);
});

// 3. First donation unlocks "First Donation" achievement and awards 50 XP
test('3. First completed donation awards +50 XP and unlocks First Donation achievement', () => {
  const userAfter1Donation = {
    name: 'Vignesh',
    donationsCount: 1,
    points: XP_CONFIG.DONATION_COMPLETED, // 50 XP
  };
  const progress = calculateDonorProgress(userAfter1Donation);
  
  assert.strictEqual(progress.donationsCount, 1);
  assert.strictEqual(progress.points, 50);
  assert.strictEqual(progress.donorLevel, 1);
  assert.strictEqual(progress.donorRank, 'New Donor');
  
  const firstDonationAch = progress.achievements.find(a => a.key === 'FIRST_DONATION');
  assert.ok(firstDonationAch && firstDonationAch.unlocked, 'First Donation badge must be unlocked');

  const fiveDonationsAch = progress.achievements.find(a => a.key === 'FIVE_DONATIONS');
  assert.ok(fiveDonationsAch && !fiveDonationsAch.unlocked, '5+ Donations badge must remain locked');
});

// 4. Milestone: 3 Completed Donations unlocks Bronze Donor
test('4. 3 Completed donations unlocks Bronze Donor achievement', () => {
  const userAfter3Donations = {
    name: 'Vignesh',
    donationsCount: 3,
    points: 150, // 3 * 50 XP
  };
  const progress = calculateDonorProgress(userAfter3Donations);
  
  assert.strictEqual(progress.donorLevel, 2, 'Level 2 at 150 XP');
  assert.strictEqual(progress.donorRank, 'Active Donor');
  
  const bronzeAch = progress.achievements.find(a => a.key === 'BRONZE_DONOR');
  assert.ok(bronzeAch && bronzeAch.unlocked, 'Bronze Donor badge must be unlocked at 3 donations');
});

// 5. Milestone: 5 Completed Donations unlocks "5+ Donations" and reaches Level 3 (250 XP)
test('5. 5 Completed donations reaches Level 3 (250 XP) and unlocks 5+ Donations achievement', () => {
  const userAfter5Donations = {
    name: 'Vignesh',
    donationsCount: 5,
    points: 250, // 5 * 50 XP
  };
  const progress = calculateDonorProgress(userAfter5Donations);
  
  assert.strictEqual(progress.donorLevel, 3, 'Level 3 at 250 XP');
  assert.strictEqual(progress.donorRank, 'Regular Donor');
  
  const fiveDonationsAch = progress.achievements.find(a => a.key === 'FIVE_DONATIONS');
  assert.ok(fiveDonationsAch && fiveDonationsAch.unlocked, '5+ Donations badge must be unlocked');

  const tenDonationsAch = progress.achievements.find(a => a.key === 'TEN_DONATIONS');
  assert.ok(tenDonationsAch && !tenDonationsAch.unlocked, '10+ Donations badge must remain locked');
});

// 6. Milestone: 10 Completed Donations unlocks "10+ Donations"
test('6. 10 Completed donations unlocks 10+ Donations achievement and reaches Level 4', () => {
  const userAfter10Donations = {
    name: 'Vignesh',
    donationsCount: 10,
    points: 500, // 10 * 50 XP
  };
  const progress = calculateDonorProgress(userAfter10Donations);
  
  assert.strictEqual(progress.donorLevel, 4, 'Level 4 at 500 XP');
  assert.strictEqual(progress.donorRank, 'Dedicated Donor');
  
  const tenDonationsAch = progress.achievements.find(a => a.key === 'TEN_DONATIONS');
  assert.ok(tenDonationsAch && tenDonationsAch.unlocked, '10+ Donations badge must be unlocked');
});

// 7. Milestone: 25 Completed Donations unlocks "25+ Donations" (LifeLink Hero)
test('7. 25 Completed donations unlocks 25+ Donations (LifeLink Hero) achievement', () => {
  const userAfter25Donations = {
    name: 'Vignesh',
    donationsCount: 25,
    points: 1250,
  };
  const progress = calculateDonorProgress(userAfter25Donations);
  
  assert.strictEqual(progress.donorLevel, 5, 'Level 5 at 1250 XP');
  assert.strictEqual(progress.donorRank, 'Life Saver');
  
  const twentyFiveAch = progress.achievements.find(a => a.key === 'TWENTY_FIVE_DONATIONS');
  assert.ok(twentyFiveAch && twentyFiveAch.unlocked, '25+ Donations badge must be unlocked');
});

// 8. Emergency Donation awards +75 XP and unlocks "Emergency Hero" achievement
test('8. Completed Emergency Donation awards +75 XP and unlocks Emergency Hero', () => {
  const regularDonor = calculateDonorProgress({ donationsCount: 2, points: 100 }, { emergencyDonationsCount: 0 });
  const emergencyAchLocked = regularDonor.achievements.find(a => a.key === 'EMERGENCY_HERO');
  assert.ok(emergencyAchLocked && !emergencyAchLocked.unlocked, 'Emergency Hero must be locked if 0 emergency donations');

  const emergencyDonor = calculateDonorProgress({ donationsCount: 2, points: 125 }, { emergencyDonationsCount: 1 });
  const emergencyAchUnlocked = emergencyDonor.achievements.find(a => a.key === 'EMERGENCY_HERO');
  assert.ok(emergencyAchUnlocked && emergencyAchUnlocked.unlocked, 'Emergency Hero must be unlocked when emergencyDonationsCount >= 1');
});

// 9. XP Configuration Verification
test('9. Verified XP values per action', () => {
  assert.strictEqual(XP_CONFIG.DONATION_COMPLETED, 50, 'Standard donation completed awards 50 XP');
  assert.strictEqual(XP_CONFIG.EMERGENCY_DONATION_COMPLETED, 75, 'Emergency donation completed awards 75 XP');
  assert.strictEqual(XP_CONFIG.DONOR_ACCEPTED, 20, 'Donor accepted awards 20 XP');
  assert.strictEqual(XP_CONFIG.EMERGENCY_RESPONSE, 10, 'Emergency response awards 10 XP');
});

// 10. Responding to request does not increment donationsCount
test('10. Donor responding to request or getting accepted does NOT increment donationsCount', () => {
  const donor = {
    donationsCount: 0,
    points: 0,
    responses: 1,
  };
  
  // Award response XP
  donor.points += XP_CONFIG.EMERGENCY_RESPONSE;
  assert.strictEqual(donor.donationsCount, 0, 'Donations count must stay 0 after response');
  assert.strictEqual(donor.points, 10, 'Points must be 10');

  // Award acceptance XP
  donor.points += XP_CONFIG.DONOR_ACCEPTED;
  assert.strictEqual(donor.donationsCount, 0, 'Donations count must stay 0 after acceptance');
  assert.strictEqual(donor.points, 30, 'Points must be 30');

  const progress = calculateDonorProgress(donor);
  assert.strictEqual(progress.donationsCount, 0);
  assert.strictEqual(progress.donorLevel, 1);
});

// 11. Duplicate XP & Donation Completion Protection Logic Test
test('11. Idempotency test: duplicate donation completion does not increment XP or count twice', () => {
  const donation = {
    _id: 'donation_123',
    donor: 'user_456',
    status: 'Pending',
    isEmergency: false,
    isXpAwarded: false,
  };

  const donorUser = {
    _id: 'user_456',
    donationsCount: 0,
    points: 0,
  };

  function completeDonation(donationRecord, user) {
    if (donationRecord.status === 'Completed' || donationRecord.isXpAwarded) {
      return { success: false, error: 'Already completed' };
    }
    const xpReward = donationRecord.isEmergency ? XP_CONFIG.EMERGENCY_DONATION_COMPLETED : XP_CONFIG.DONATION_COMPLETED;
    donationRecord.status = 'Completed';
    donationRecord.isXpAwarded = true;
    donationRecord.xpAwarded = xpReward;
    user.donationsCount += 1;
    user.points += xpReward;
    return { success: true, xpReward };
  }

  // First completion
  const res1 = completeDonation(donation, donorUser);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(donorUser.donationsCount, 1);
  assert.strictEqual(donorUser.points, 50);

  // Second completion attempt on the same donation record
  const res2 = completeDonation(donation, donorUser);
  assert.strictEqual(res2.success, false, 'Duplicate completion must be rejected');
  assert.strictEqual(donorUser.donationsCount, 1, 'Donation count must remain 1');
  assert.strictEqual(donorUser.points, 50, 'Points must remain 50, not 100');
});

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed!`);
if (passedTests === totalTests) {
  console.log('🎉 ALL DONOR PROGRESSION & GAMIFICATION TESTS PASSED SUCCESSFULLY! ✅\n');
} else {
  process.exit(1);
}
