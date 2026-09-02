const config = require('../config/config');

function isAuthorized(interaction) {
  const userId = interaction.user.id;
  const memberRoles = interaction.member ? interaction.member.roles.cache : null;

  const isUserAllowed = config.ALLOWED_USERS && config.ALLOWED_USERS.includes(userId);
  let isRoleAllowed = false;
  if (memberRoles && config.ALLOWED_ROLES && config.ALLOWED_ROLES.length > 0) {
    isRoleAllowed = config.ALLOWED_ROLES.some(roleId => memberRoles.has(roleId));
  }

  return isUserAllowed || isRoleAllowed;
}

module.exports = { isAuthorized };
