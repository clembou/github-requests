const validateRepository = (organisation, repo, projects) => {
  if (projects.filter(p => p.organisation == organisation && p.repository == repo).length == 0) {
    console.error(`Request App: Repository not found : ${organisation}/${repo}`);
    return false;
  } else {
    console.log(`Request App: Valid repository: ${organisation}/${repo}`);
    return true;
  }
};

module.exports = validateRepository;