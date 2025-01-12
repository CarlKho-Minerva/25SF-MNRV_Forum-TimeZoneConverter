const timezoneSelect = document.getElementById('timezoneSelect');
const updateButton = document.getElementById('updateButton');

updateButton.addEventListener('click', () => {
  const selectedTimezone = timezoneSelect.value;

  // Store the selected timezone (optional)
  chrome.storage.sync.set({ timezone: selectedTimezone });

  // Send a message to the content script to update the times
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "updateTimezone" });
  });
});
