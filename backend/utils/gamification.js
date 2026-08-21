/**
 * LifeLink Gamification & Progression Engine
 */

const XP_CONFIG = {
  ACCOUNT_VERIFIED: 10,
  PROFILE_COMPLETED: 10,
  EMERGENCY_RESPONSE: 10,
  DONOR_ACCEPTED: 20,
  DONATION_COMPLETED: 50,
  EMERGENCY_DONATION_COMPLETED: 75,
  ATTEND_CAMP: 20,
};

const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, maxXp: 99, rank: 'New Donor', nextLevelXp: 100 },
  { level: 2, minXp: 100, maxXp: 249, rank: 'Active Donor', nextLevelXp: 250 },
  { level: 3, minXp: 250, maxXp: 499, rank: 'Regular Donor', nextLevelXp: 500 },
  { level: 4, minXp: 500, maxXp: 999, rank: 'Dedicated Donor', nextLevelXp: 1000 },
  { level: 5, minXp: 1000, maxXp: 1999, rank: 'Life Saver', nextLevelXp: 2000 },
  { level: 6, minXp: 2000, maxXp: Infinity, rank: 'LifeLink Champion', nextLevelXp: null },
];

const ALL_ACHIEVEMENTS = [
  {
    key: 'FIRST_DONATION',
    title: 'First Donation',
    description: 'Complete your first blood donation',
    icon: '🩸',
    requiredDonations: 1,
  },
  {
    key: 'BRONZE_DONOR',
    title: '3+ Donations',
    description: 'You have completed 3 blood donations',
    icon: '🥉',
    requiredDonations: 3,
  },
  {
    key: 'FIVE_DONATIONS',
    title: '5+ Donations',
    description: 'You have completed 5 blood donations',
    icon: '🏅',
    requiredDonations: 5,
  },
  {
    key: 'TEN_DONATIONS',
    title: '10+ Donations',
    description: 'You have completed 10 blood donations',
    icon: '🏆',
    requiredDonations: 10,
  },
  {
    key: 'TWENTY_FIVE_DONATIONS',
    title: '25+ Donations',
    description: 'LifeLink Hero with 25 blood donations',
    icon: '❤️',
    requiredDonations: 25,
  },
  {
    key: 'EMERGENCY_HERO',
    title: 'Emergency Hero',
    description: 'Completed an emergency blood donation',
    icon: '🚨',
    requiredEmergencyDonations: 1,
  },
  {
    key: 'ACTIVE_RESPONDER',
    title: 'Active Responder',
    description: 'Active and ready to respond to community alerts',
    icon: '⚡',
    requiredResponses: 1,
  },
];

const calculateDonorLevelAndRank = (points = 0) => {
  const pts = Math.max(0, Number(points) || 0);
  for (const tier of LEVEL_THRESHOLDS) {
    if (pts >= tier.minXp && (tier.maxXp === Infinity || pts <= tier.maxXp)) {
      const currentLevelMin = tier.minXp;
      const nextLevelXp = tier.nextLevelXp;
      let progressPercent = 0;
      let pointsInCurrentLevel = pts - currentLevelMin;
      let pointsNeededNextLevel = nextLevelXp ? nextLevelXp - pts : 0;

      if (nextLevelXp) {
        const levelSpan = nextLevelXp - currentLevelMin;
        progressPercent = Math.min(100, Math.max(0, Math.round((pointsInCurrentLevel / levelSpan) * 100)));
      } else {
        progressPercent = 100;
        pointsNeededNextLevel = 0;
      }

      return {
        donorLevel: tier.level,
        donorRank: tier.rank,
        currentLevelMin,
        nextLevelXp,
        pointsInCurrentLevel,
        pointsNeededNextLevel,
        progressPercent,
      };
    }
  }
  return {
    donorLevel: 1,
    donorRank: 'New Donor',
    currentLevelMin: 0,
    nextLevelXp: 100,
    pointsInCurrentLevel: 0,
    pointsNeededNextLevel: 100,
    progressPercent: 0,
  };
};

const evaluateAchievements = (stats = {}) => {
  const donationsCount = Number(stats.donationsCount) || 0;
  const emergencyDonationsCount = Number(stats.emergencyDonationsCount) || 0;
  const responsesCount = Number(stats.responsesCount) || 0;
  const isAvailable = Boolean(stats.availability);

  return ALL_ACHIEVEMENTS.map(ach => {
    let unlocked = false;

    if (ach.requiredDonations !== undefined) {
      unlocked = donationsCount >= ach.requiredDonations;
    } else if (ach.requiredEmergencyDonations !== undefined) {
      unlocked = emergencyDonationsCount >= ach.requiredEmergencyDonations;
    } else if (ach.requiredResponses !== undefined) {
      unlocked = responsesCount >= ach.requiredResponses || isAvailable;
    }

    return {
      ...ach,
      unlocked,
    };
  });
};

const calculateDonorProgress = (user, extraStats = {}) => {
  const points = Number(user?.points) || 0;
  const donationsCount = Number(user?.donationsCount) || 0;
  const levelInfo = calculateDonorLevelAndRank(points);
  const achievements = evaluateAchievements({
    donationsCount,
    emergencyDonationsCount: extraStats.emergencyDonationsCount || 0,
    responsesCount: user?.responses || extraStats.responsesCount || 0,
    availability: user?.status === 'active' || user?.availability,
  });

  return {
    points,
    donationsCount,
    ...levelInfo,
    achievements,
    unlockedAchievementsCount: achievements.filter(a => a.unlocked).length,
    totalAchievementsCount: achievements.length,
  };
};

module.exports = {
  XP_CONFIG,
  LEVEL_THRESHOLDS,
  ALL_ACHIEVEMENTS,
  calculateDonorLevelAndRank,
  evaluateAchievements,
  calculateDonorProgress,
};
