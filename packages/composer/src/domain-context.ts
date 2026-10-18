import type { ArchetypeDefinition } from './archetypes.js';

export function isEmployeeExperienceBrief(text: string): boolean {
  return /\b(employee(?:s| experience)?|human resources|people operations|hr platform|hr management)\b/i.test(text) && !/\b(applicant tracking|recruitment pipeline)\b/i.test(text);
}

/** Specialise the existing people-operations archetype without inventing another stack. */
export function specialisePeopleOperations(base: ArchetypeDefinition, text: string): ArchetypeDefinition {
  if (base.id !== 'recruitment' || !isEmployeeExperienceBrief(text)) return base;
  return {
    ...base, name:'Employee Experience',
    primaryAudience:'Employees, team leads and people operations teams',
    primaryObjective:'Deliver a connected employee experience where colleagues build team relationships, complete onboarding, share feedback and access organisational policies',
    userSophistication:55, informationComplexity:55, dataDensity:55, transactionCriticality:30,
    defaultEntities:[
      {name:'Employee',description:'A colleague with a team, role and onboarding progress',fields:['id','name','team','role','onboardingStatus']},
      {name:'Team',description:'A group of colleagues with a shared purpose and manager',fields:['id','name','manager','members']},
      {name:'Policy',description:'Organisational guidance with acknowledgement history',fields:['id','title','version','acknowledgedAt']},
    ],
    defaultWorkflows:[
      {id:'onboard-employee',name:'Welcome a colleague and complete onboarding milestones',steps:['meet-buddy','read-policies','join-team','complete-check-in']},
      {id:'employee-engagement',name:'Share a team pulse and recognise a colleague',steps:['share-feedback','recognise-colleague','review-team-pulse']},
      {id:'manage-policies',name:'Review organisational policies and notification preferences',steps:['read-policy','acknowledge-policy','save-preferences']},
    ],
    recommendedScreens:[
      {name:'Marketing Home',screenType:'marketing',purpose:'Introduce a warm, connected employee experience',jobs:['discover-platform'],required:true},
      {name:'Team Overview',screenType:'dashboard',purpose:'Refined employee summary and upcoming team actions',jobs:['review-team-pulse','review-onboarding'],required:true},
      {name:'People Directory',screenType:'index-list',purpose:'Find colleagues and their teams',jobs:['find-colleague'],required:true},
      {name:'Teams',screenType:'index-list',purpose:'Explore team membership and shared priorities',jobs:['find-team'],required:true},
      {name:'Onboarding',screenType:'onboarding',purpose:'Playful welcome journey with clear milestones',jobs:['complete-onboarding'],required:true},
      {name:'Engagement',screenType:'dashboard',purpose:'Review employee feedback and recognition',jobs:['share-feedback','recognise-colleague'],required:true},
      {name:'Settings & Policies',screenType:'settings',purpose:'Conservative policy acknowledgements and account preferences',jobs:['acknowledge-policy','save-preferences'],required:true},
    ],
    requiredCapabilities:['people-directory','team-membership','onboarding-checklist','policy-acknowledgements'],
  };
}
