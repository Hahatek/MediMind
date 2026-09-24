// Backend serializuje enumy jako stringi (JsonStringEnumConverter)

export type BloodType = 'APlus' | 'AMinus' | 'BPlus' | 'BMinus' | 'ZeroPlus' | 'ZeroMinus' | 'ABPlus' | 'ABMinus';
export type RoleUser = 'Child' | 'Senior' | 'Adult';
export type Gender = 'Male' | 'Female' | 'Other';
export type ExaminationsStatus = 'Sudden' | 'Pending' | 'Scheduled' | 'InProgress' | 'Planned' | 'Skipped' | 'Completed';
export type MedicationTime = 'Morning' | 'Afternoon' | 'Evening' | 'BeforeSleep';
export type AuthorChat = 'ChatBot' | 'User';
export type ChangeRequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type IntakeStatus = 'Taken' | 'Skipped';
export type TodayIntakeStatus = 'Pending' | 'Taken' | 'Skipped';
