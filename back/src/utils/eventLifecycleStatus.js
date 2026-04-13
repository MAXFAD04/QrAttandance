/**
 * Вычисляет «эффективный» статус мероприятия по датам для записей,
 * опубликованных в каталоге (в БД lifecycle хранится как published).
 */
function resolvePublishedLifecycleStatus(event) {
  const status = event.status;
  if (status === 'draft' || status === 'cancelled') {
    return status;
  }
  if (status === 'completed') {
    return 'completed';
  }

  const now = Date.now();
  const start = new Date(event.startDate).getTime();
  const end = new Date(event.endDate).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return status;
  }

  if (now < start) {
    return 'published';
  }
  if (now <= end) {
    return 'ongoing';
  }
  return 'completed';
}

module.exports = { resolvePublishedLifecycleStatus };
