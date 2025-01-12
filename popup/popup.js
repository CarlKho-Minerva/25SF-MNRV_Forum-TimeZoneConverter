document.addEventListener("DOMContentLoaded", function () {
  const timezoneSelect = document.getElementById("timezoneSelect");
  const updateButton = document.getElementById("updateButton");

  // Load saved timezone
  chrome.storage.sync.get("timezone", function (data) {
    if (data.timezone) {
      timezoneSelect.value = data.timezone;
    }
  });

  // Update handler
  function updateTimezone() {
    const selectedTimezone = timezoneSelect.value;
    chrome.storage.sync.set({ timezone: selectedTimezone }, function () {
      // Notify all tabs
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateTimezone",
          timezone: selectedTimezone,
        });
      });
    });
  }

  // Add event listeners
  timezoneSelect.addEventListener("change", updateTimezone);
  updateButton.addEventListener("click", updateTimezone);
});
