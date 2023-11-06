function getHumanReadableDate(timeStamp) {
  if (typeof timeStamp !== 'number') {
    return 'N/A';
  }
  const date = new Date(timeStamp * 1000);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}
