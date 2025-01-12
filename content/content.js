function injectTimezoneSelector() {
  const coursesLi = document.querySelector("li.sidebar-item-view.courses");
  if (coursesLi) {
    const localTimezone = moment.tz.guess();
    const selectorDiv = document.createElement("div");
    selectorDiv.className = "timezone-selector";
    selectorDiv.style.cssText =
      'padding: 8px 16px; background: #fafafa; border-bottom: 1px solid #eaeaea; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;';

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
      <label style="font-size: 12px; color: #666; display: block; margin-bottom: 4px; font-weight: 500;">Timezone Display:</label>
      <select id="userTimezone" style="width: 100%; padding: 6px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 12px; color: #333; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        ${options}
      </select>
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

  if (!userTimezone) return; // Guard against missing element

  listItems.forEach((item) => {
    const text = item.textContent;
    // Updated regex to handle course codes and names
    const match = text.match(/^(.+?)@(\d{1,2}:\d{2})(AM|PM)\s+([A-Za-z\s]+)$/);

    if (match) {
      const courseInfo = match[1];
      const time = match[2];
      const ampm = match[3];
      const city = match[4];
      const sourceTimezone = getTimezoneForCity(city);

      if (sourceTimezone) {
        try {
          // Create a moment object in the source timezone
          const sourceTime = moment.tz(
            `${time} ${ampm}`,
            "h:mm A",
            sourceTimezone
          );

          // Convert to the target timezone
          const targetTime = sourceTime.clone().tz(userTimezone.value);

          // Format the time
          const localTime = targetTime.format("h:mmA");
          const displayName = getDisplayNameForTimezone(userTimezone.value);

          // Update the text
          item.textContent = `${courseInfo}@${localTime} ${displayName}`;

          // Add title attribute for full timezone info
          item.parentElement.title = `Original: ${time} ${ampm} ${city} (${sourceTimezone})
Converted: ${localTime} (${userTimezone.value})`;
        } catch (e) {
          console.error("Time conversion error:", e);
        }
      }
    }
  });
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
