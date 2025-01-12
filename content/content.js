
function convertTimezones() {
  const listItems = document.querySelectorAll('.sidebar-sub-items-list .sidebar-sub-item-view .navigation-link .link-text');

  listItems.forEach(item => {
    const text = item.textContent;
    const match = text.match(/@(\d{2}:\d{2})(AM|PM) ([A-Za-z\s]+)$/);

    if (match) {
      const time = match[1];
      const ampm = match[2];
      const city = match[3];

      // Get timezone (you might need a timezone database for accurate conversion)
      const timezone = getTimezoneForCity(city); // Implement this function

      // Convert time (you'll need a library like moment-timezone for this)
      if (timezone) {
        const convertedTime = convertToLocalTime(time, ampm, timezone); // Implement this function
        item.textContent = text.replace(/@.*/, `@${convertedTime} Your Time`);
      }
    }
  });
}

function getTimezoneForCity(city) {
  // Very basic example - replace with a proper timezone lookup
  const timezones = {
    "Seoul": "Asia/Seoul",
    "Buenos Aires": "America/Argentina/Buenos_Aires",
    // Add more cities and timezones
  };
  return timezones[city];
}

function convertToLocalTime(time, ampm, timezone) {
  // Use moment-timezone library to perform the conversion
  const format = 'hh:mmA'; // Input time format
  const sourceTime = moment.tz(`${time}${ampm}`, format, timezone);
  const localTime = sourceTime.local().format('hh:mmA'); // Format to your desired output format
  return localTime;
}

// Run the conversion when the page loads
convertTimezones();

// Optional: Listen for messages from the popup (if you implement timezone selection)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimezone") {
    convertTimezones(); // Re-run conversion after timezone change
  }
});
