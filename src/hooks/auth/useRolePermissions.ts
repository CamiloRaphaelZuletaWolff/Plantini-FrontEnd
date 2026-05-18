import { useUserProfile } from '../profile/useUserProfile';
import { UserRoleType } from '../../types';

export const useRolePermissions = () => {
  const { user } = useUserProfile();

  const canCreateOpportunity = () => {
    return user?.role === 'admin' || user?.role === 'organizer';
  };

  const canManageOpportunities = () => {
    return user?.role === 'admin' || user?.role === 'organizer';
  };

  const canUpdateApplicationStatus = () => {
    return user?.role === 'admin' || user?.role === 'organizer';
  };

  const canViewAllApplications = () => {
    return user?.role === 'admin' || user?.role === 'organizer';
  };

  const isStudent = () => {
    return user?.role === 'student';
  };

  return {
    canCreateOpportunity,
    canManageOpportunities,
    canUpdateApplicationStatus,
    canViewAllApplications,
    isStudent,
    userRole: user?.role as UserRoleType,
  };
};