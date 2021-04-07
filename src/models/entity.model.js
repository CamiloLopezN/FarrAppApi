const { model } = require('mongoose');

const Client = model('Client', require('./schemas/client.schema'), 'users');
const Admin = model('Admin', require('./schemas/admin.schema'), 'users');
const Company = model('Company', require('./schemas/company.schema'), 'users');
const Role = model('Role', require('./schemas/role.schema'), 'roles');
const Establishment = model(
  'Establishment',
  require('./schemas/establishment.schema'),
  'establishments',
);
const EstablishmentCategory = model(
  'EstablishmentCategory',
  require('./schemas/establishmentCategory.schema'),
  'establishmentCategories',
);
const EstablishmentType = model(
  'EstablishmentType',
  require('./schemas/establishmentType.schema'),
  'establishmentTypes',
);
const Event = model('Event', require('./schemas/event.schema'), 'events');
const EventCategory = model(
  'EventCategory',
  require('./schemas/eventCategory.schema'),
  'eventCategories',
);
const DressCode = model('DressCode', require('./schemas/dressCode.schema'), 'dressCodes');
const TicketStatus = model(
  'TicketStatus',
  require('./schemas/ticketStatus.schema'),
  'eventTicketStatus',
);

module.exports = {
  Client,
  Admin,
  Company,
  Role,
  Establishment,
  EstablishmentCategory,
  EstablishmentType,
  Event,
  EventCategory,
  DressCode,
  TicketStatus,
};
