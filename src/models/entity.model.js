const { model } = require('mongoose');

const client = model('Client', require('./schemas/user.schema'), 'users');
const admin = model('Admin', require('./schemas/admin.schema'), 'users');
const company = model('Company', require('./schemas/company.schema'), 'users');
const role = model('Role', require('./schemas/role.schema'), 'roles');
const establishment = model(
  'Establishment',
  require('./schemas/establishment.schema'),
  'establishments',
);
const establishmentCategory = model(
  'EstablishmentCategory',
  require('./schemas/establishmentCategory.schema'),
  'establishmentCategories',
);
const establishmentType = model(
  'EstablishmentType',
  require('./schemas/establishmentType.schema'),
  'establishmentTypes',
);
const event = model('Event', require('./schemas/event.schema'), 'events');
const eventCategory = model(
  'EventCategory',
  require('./schemas/eventCategory.schema'),
  'eventCategories',
);
const dressCode = model('DressCode', require('./schemas/dressCode.schema'), 'dressCodes');
const ticketStatus = model(
  'TicketStatus',
  require('./schemas/ticketStatus.schema'),
  'eventTicketStatus',
);

module.exports = {
  client,
  admin,
  company,
  role,
  establishment,
  establishmentCategory,
  establishmentType,
  event,
  eventCategory,
  dressCode,
  ticketStatus,
};
