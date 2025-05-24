async function fetchOverdueTasks() {
  try {
    const overdueTasksResponse = await fetch(
      'http://localhost:3000/tasks/overdue/all',
      { credentials: 'include' },
    ).catch((err) => console.log(err));

    const { message, overdueTasks } = await overdueTasksResponse.json();

    return { message, overdueTasks };
  } catch (error) {
    console.log(error);
  }
}

export { fetchOverdueTasks };
