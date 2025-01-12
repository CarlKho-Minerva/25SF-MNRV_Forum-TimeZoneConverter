function injectTimezoneSelector() {
  const coursesLi = document.querySelector("li.sidebar-item-view.courses");
  if (coursesLi) {
    const localTimezone = moment.tz.guess();
    const selectorDiv = document.createElement("div");
    selectorDiv.className = "timezone-selector";
    selectorDiv.style.cssText = `
      padding: 12px 16px 16px;
      background: #343434;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0 -1px;
    `;

    // Create options with local time indicator
    const timezones = {
      "America/Los_Angeles": "SF",
      "America/Argentina/Buenos_Aires": "BA",
      "Asia/Seoul": "Seoul",
      "Asia/Taipei": "Taipei",
      "Asia/Kolkata": "Hyderabad",
      "Europe/Berlin": "Berlin",
      "Asia/Tokyo": "Tokyo",
    };

    const options = Object.entries(timezones)
      .map(([tz, label]) => {
        const isLocal = tz === localTimezone ? " (Local Time)" : "";
        return `<option value="${tz}">${label}${isLocal}</option>`;
      })
      .join("");

    selectorDiv.innerHTML = `
      <label style="
        font-size: 13px;
        color: rgba(255,255,255,0.85);
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        letter-spacing: 0.01em;
      ">
        <svg style="
          width: 15px;
          height: 15px;
          vertical-align: -2px;
          margin-right: 6px;
          fill: currentColor;
          opacity: 0.9
        " viewBox="0 0 24 24">
          <path d="M12,0C18.6,0 24,5.4 24,12C24,18.6 18.6,24 12,24C5.4,24 0,18.6 0,12C0,5.4 5.4,0 12,0M12,2C6.5,2 2,6.5 2,12C2,17.5 6.5,22 12,22C17.5,22 22,17.5 22,12C22,6.5 17.5,2 12,2M12.5,7V12.3L17,14.9L16.3,16.2L11,13V7H12.5Z"></path>
        </svg>
        Timezone Display
      </label>
      <select id="userTimezone" style="
        width: 100%;
        padding: 8px 28px 8px 10px;
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.3;
        color: rgba(255,255,255,0.95);
        background: #2a2a2a;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        appearance: none;
        position: relative;
        font-family: inherit;
        letter-spacing: 0.01em;
      ">
        ${options}
      </select>
      <div style="position: relative;">
        <svg style="
          position: absolute;
          right: 10px;
          top: -26px;
          width: 14px;
          height: 14px;
          fill: rgba(255,255,255,0.7);
          pointer-events: none
        " viewBox="0 0 24 24">
          <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path>
        </svg>
      </div>
    `;

    const section = coursesLi.querySelector("section.navigable-children");
    if (section) {
      section.insertBefore(selectorDiv, section.firstChild);
    }

    // Set initial timezone (prefer stored, fallback to local)
    chrome.storage.sync.get("timezone", function (data) {
      const userTimezone = document.getElementById("userTimezone");
      userTimezone.value = data.timezone || localTimezone;
      convertTimezones(); // Initial conversion

      // Add change event listener that immediately converts
      userTimezone.addEventListener("change", function (e) {
        chrome.storage.sync.set({ timezone: e.target.value }, () => {
          // Force immediate conversion after timezone change
          setTimeout(convertTimezones, 0);
        });
      });
    });
  }
}

function getDisplayNameForTimezone(timezone) {
  const displayNames = {
    "America/Los_Angeles": "SF",
    "America/Argentina/Buenos_Aires": "BA",
    "Asia/Seoul": "Seoul",
    "Asia/Taipei": "Taipei",
    "Asia/Kolkata": "Hyderabad",
    "Europe/Berlin": "Berlin",
    "Asia/Tokyo": "Tokyo",
  };
  return displayNames[timezone] || timezone.split("/").pop().replace("_", " ");
}

function getTimezoneForCity(city) {
  const timezones = {
    Seoul: "Asia/Seoul",
    BA: "America/Argentina/Buenos_Aires",
    "Buenos Aires": "America/Argentina/Buenos_Aires",
    SF: "America/Los_Angeles",
    "San Francisco": "America/Los_Angeles",
    Taipei: "Asia/Taipei",
    Hyderabad: "Asia/Kolkata",
    Berlin: "Europe/Berlin",
    Tokyo: "Asia/Tokyo",
  };
  return timezones[city.trim()];
}

function convertTimezones() {
  const listItems = document.querySelectorAll(
    ".sidebar-sub-items-list .sidebar-sub-item-view .navigation-link .link-text"
  );
  const userTimezone = document.getElementById("userTimezone");

  if (!userTimezone) return;

  listItems.forEach((item) => {
    const text = item.textContent;
    // Updated regex to handle days (like MW, TTh, WF)
    const match = text.match(
      /^(.+?),\s*([A-Za-z,\s]+)@(\d{1,2}:\d{2})(AM|PM)\s+([A-Za-z\s]+)$/
    );

    if (match) {
      const courseInfo = match[1];
      const days = match[2];
      const time = match[3];
      const ampm = match[4];
      const city = match[5];
      const sourceTimezone = getTimezoneForCity(city);

      if (sourceTimezone) {
        try {
          const sourceTime = moment.tz(
            `${time} ${ampm}`,
            "h:mm A",
            sourceTimezone
          );
          const targetTime = sourceTime.clone().tz(userTimezone.value);

          // Check if the day changes due to timezone difference
          const sourceDayOfWeek = sourceTime.day();
          const targetDayOfWeek = targetTime.day();

          // Convert days if needed
          let convertedDays = convertDays(
            days,
            sourceDayOfWeek !== targetDayOfWeek,
            targetTime.isBefore(sourceTime)
          );

          const localTime = targetTime.format("h:mmA");
          const displayName = getDisplayNameForTimezone(userTimezone.value);

          // Store original text for hover
          const originalText = `${courseInfo}, ${days}@${time}${ampm} ${city}`;

          // Update the displayed text
          item.textContent = `${courseInfo}, ${convertedDays}@${localTime} ${displayName}`;

          // Enhanced tooltip with more details
          item.parentElement.title = `Original: ${originalText}
Converting from: ${city} (${sourceTimezone})
Converted to: ${displayName} (${userTimezone.value})
Note: Class days may shift due to timezone differences`;
        } catch (e) {
          console.error("Time conversion error:", e);
        }
      }
    }
  });
}

function convertDays(days, shouldShift, isEarlier) {
  if (!shouldShift) return days;

  const dayMap = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
    Sa: "Saturday",
    Su: "Sunday",
  };

  // Split the days string into individual days
  const daysList = days.split(/(?=[A-Z])/).filter((d) => d);

  // Shift days based on timezone difference
  return daysList
    .map((day) => {
      let idx = Object.keys(dayMap).indexOf(day);
      if (idx === -1) return day;

      // Adjust index based on whether the time shifts forward or backward
      idx = (idx + (isEarlier ? -1 : 1) + 7) % 7;
      return Object.keys(dayMap)[idx];
    })
    .join("");
}

// Add observer to handle dynamic content loading
function initializeObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        const coursesElement = document.querySelector(
          "li.sidebar-item-view.courses"
        );
        if (coursesElement && !document.querySelector(".timezone-selector")) {
          observer.disconnect();
          injectTimezoneSelector();
          convertTimezones();
          break;
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Replace DOMContentLoaded with initialization function
function initialize() {
  const coursesElement = document.querySelector("li.sidebar-item-view.courses");
  if (coursesElement) {
    injectTimezoneSelector();
    convertTimezones();
  } else {
    initializeObserver();
  }
}

// Run initialization
initialize();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimezone") {
    convertTimezones();
  }
});
