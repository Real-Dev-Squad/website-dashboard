function getHumanReadableDate(timeStamp) {
  if (typeof timeStamp !== 'number') {
    return 'N/A';
  }
  const date = new Date(timeStamp);

  const options = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const parts = date.toLocaleDateString('en-US', options).split(', ');

  const [weekday, monthDay, year] = parts;
  const [month, day] = monthDay.split(' ');

  const formattedDate = `${weekday}, ${day} ${month} ${year}`;

  return formattedDate;
}
