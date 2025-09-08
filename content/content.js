let originalCourseTimes = new Map();

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

function getTimezoneForCity(cityName) {
  const cityMap = {
    "SF": "America/Los_Angeles",
    "San Francisco": "America/Los_Angeles",
    "BA": "America/Argentina/Buenos_Aires",
    "Buenos Aires": "America/Argentina/Buenos_Aires",
    "Seoul": "Asia/Seoul",
    "Taipei": "Asia/Taipei",
    "Hyderabad": "Asia/Kolkata",
    "Berlin": "Europe/Berlin",
    "Tokyo": "Asia/Tokyo",
    "UTC": "UTC"
  };
  return cityMap[cityName] || "UTC"; // Default to UTC if city not found
}


function convertTimeToTargetTimezone(timeStr, fromTimezone, toTimezone) {
  const [days, time] = timeStr.split("@");
  
  // Fixed day mapping - use single letters for parsing
  const dayMap = {
    M: "Monday",
    T: "Tuesday", 
    W: "Wednesday",
    R: "Thursday", // Thursday is 'R' in academic scheduling
    F: "Friday",
    S: "Saturday",
    U: "Sunday"
  };
  
  // Reverse map for converting back to abbreviations
  const dayAbbrevMap = {
    "Monday": "M",
    "Tuesday": "T",
    "Wednesday": "W", 
    "Thursday": "R",
    "Friday": "F",
    "Saturday": "S",
    "Sunday": "U"
  };

  // Parse days string - handle both old format (MTh, WF) and single letters
  let daysArr = [];
  if (days.includes("Th")) {
    // Handle "Th" as special case
    daysArr = days.replace(/Th/g, "R").match(/[MTWRFSU]/g) || [];
  } else {
    // Split into individual characters
    daysArr = days.match(/[MTWRFSU]/g) || [];
  }
  
  console.log("Original days:", days, "Parsed as:", daysArr);
  
  let results = [];

  daysArr.forEach((day) => {
    const dayFullName = dayMap[day];
    if (!dayFullName) {
      console.log("Unknown day abbreviation:", day);
      return;
    }

    // Create a specific date for this day of the week
    const baseDate = moment().startOf("week");
    let dateTime = moment.tz(
      baseDate.format("YYYY-MM-DD ") + time,
      "YYYY-MM-DD h:mmA",
      fromTimezone
    ).day(dayFullName);

    // Convert to target timezone
    let converted = dateTime.clone().tz(toTimezone);
    
    // Get the actual day in target timezone
    let targetDay = converted.format("dddd");
    let convertedDayAbbrev = dayAbbrevMap[targetDay];
    
    if (convertedDayAbbrev) {
      results.push(convertedDayAbbrev);
    }
    
    console.log(`${day} (${dayFullName}) -> ${convertedDayAbbrev} (${targetDay})`);
  });

  // Convert time
  const convertedTime = moment
    .tz(moment().format("YYYY-MM-DD ") + time, "YYYY-MM-DD h:mmA", fromTimezone)
    .tz(toTimezone)
    .format("h:mmA");

  // Remove duplicates and sort days in standard order
  const uniqueDays = [...new Set(results)];
  const dayOrder = ["M", "T", "W", "R", "F", "S", "U"];
  const sortedDays = dayOrder.filter(day => uniqueDays.includes(day)).join("");
  
  const result = sortedDays + "@" + convertedTime;
  console.log("Final conversion result:", result);
  
  return result;
}

function convertTimezones() {
  console.log("Starting timezone conversion..."); // Debug log
  const listItems = document.querySelectorAll(
    ".sidebar-sub-items-list .sidebar-sub-item-view .navigation-link .link-text"
  );
  const userTimezoneSelect = document.getElementById("userTimezone");

  if (!userTimezoneSelect) {
    console.log("No timezone selector found"); // Debug log
    return;
  }

  const userTimezone = userTimezoneSelect.value;
  console.log("Converting to timezone:", userTimezone); // Debug log

  listItems.forEach((item) => {
    const text = item.textContent;
    // Use the stored original data to prevent re-parsing potentially modified text
    const courseInfoMatch = text.match(/^(.+?),/);
    if (!courseInfoMatch) return;

    const courseInfo = courseInfoMatch[1].trim();
    const originalData = originalCourseTimes.get(courseInfo);
    console.log("Processing course:", courseInfo, "Original data:", originalData); // Debug log

    if (originalData) {
      try {
        const sourceTimezone = originalData.timezone;
        console.log("Converting from", sourceTimezone, "to", userTimezone); // Debug log

        const convertedTimeStr = convertTimeToTargetTimezone(
          `${originalData.days}@${originalData.time}`,
          sourceTimezone,
          userTimezone
        );
        const displayName = getDisplayNameForTimezone(userTimezone);

        console.log("Converted time string:", convertedTimeStr); // Debug log

        // Update the displayed text
        item.textContent = `${courseInfo}, ${convertedTimeStr} ${displayName}`;

        // Enhanced tooltip for UTC
        item.parentElement.title = `Original Time: ${originalData.days}@${originalData.time} ${originalData.city}
Converted to: ${displayName} (${userTimezone})
Note: Class days may shift due to timezone differences`;
      } catch (e) {
        console.error("Time conversion error for", courseInfo, ":", e);
      }
    } else {
      console.log("No original data found for:", courseInfo); // Debug log
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
          setTimeout(() => {
            storeOriginalTimes();
            injectTimezoneSelector();
            convertTimezones();
          }, 1000);
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
    // Add delay to ensure dynamic content is loaded
    setTimeout(() => {
      // Store original times before any conversion
      storeOriginalTimes();
      injectTimezoneSelector();
      convertTimezones();
    }, 1000); // 1 second delay
  } else {
    initializeObserver();
  }
}

// Add new function to store original times
function storeOriginalTimes() {
  const listItems = document.querySelectorAll(
    ".sidebar-sub-items-list .sidebar-sub-item-view .navigation-link .link-text"
  );

  originalCourseTimes.clear(); // Clear existing stored times

  listItems.forEach((item) => {
    const text = item.textContent.trim();
    console.log("Processing course text:", text); // Debug log

    // Try UTC format first (new format) - with optional minutes
    let match = text.match(
      /^(.+?),\s*([A-Za-z,\s]+)@(\d{1,2}):?(\d{2})?(AM|PM)\s+(UTC)$/i
    );

    // If UTC format not found, try old city format (backward compatibility)
    if (!match) {
      match = text.match(
        /^(.+?),\s*([A-Za-z,\s]+)@(\d{1,2}):?(\d{2})?(AM|PM)\s+([A-Za-z\s]+)$/i
      );
    }

    if (match) {
      const courseInfo = match[1].trim();
      const days = match[2].trim();
      const hours = match[3];
      const minutes = match[4] || "00"; // Default to 00 if no minutes
      const ampm = match[5];
      const time = `${hours}:${minutes}${ampm}`;
      const city = match[6].trim();

      console.log("Matched course:", { courseInfo, days, time, city }); // Debug log

      // Determine source timezone based on format
      let sourceTimezone;
      if (city === "UTC") {
        sourceTimezone = "UTC";
      } else {
        sourceTimezone = getTimezoneForCity(city);
      }

      // Store original time info using course name as key
      originalCourseTimes.set(courseInfo, {
        days: days,
        time: time,
        city: city,
        timezone: sourceTimezone,
      });

      console.log("Stored course data:", originalCourseTimes.get(courseInfo)); // Debug log
    } else {
      console.log("No match for text:", text); // Debug log
    }
  });
}

// Run initialization
initialize();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimezone") {
    convertTimezones();
  }
});
