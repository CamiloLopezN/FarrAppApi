const { EventStatus } = require('../../models/entity.model');

module.exports.initEventStatus = async () => {
  const terminated = new EventStatus({
    eventStatusName: 'Termminado',
    description: 'El evento ha concluido',
  });

  const postponed = new EventStatus({
    eventStatusName: 'Aplazado',
    description: 'El evento ha concluido',
  });

  const inactive = new EventStatus({
    eventStatusName: 'Inactivo',
    description: 'El evento se ha desactivado indefinidamente',
  });

  const active = new EventStatus({
    eventStatusName: 'Activo',
    description: 'El evento se encuentra publicado',
  });

  await active.save();
  await inactive.save();
  await postponed.save();
  await terminated.save();
};
