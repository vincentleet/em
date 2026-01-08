// js/erma.js
// --------------------------------------------------
// ERMA logging + Firebase RTDB
// --------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* --------------------------------------------------
   Static ERMA metadata (room / puzzle identity)
-------------------------------------------------- */

const ERMA_BASE_FIELDS = {
  "ERMA Branch": "rotorua.escapemasters.co.nz",
  "ERMA Room ID": "QAE0LsitCjkwvPFwQl",
  "ERMA Room Name": "Gangster Chase 1",
  "ERMA Puzzle ID": "puzzleid-gc1-brphone",
  "ERMA Puzzle Name": "Backroom phone"
};

/* --------------------------------------------------
   Event definitions
-------------------------------------------------- */

const LOG_EVENTS = {
  PAGE_LOADED: {
    event: "page_loaded",
    fields: {
      "ERMA Puzzle Connection Status": "Ready",
      "ERMA Puzzle Status": "Conversation ready",
      "ERMA Puzzle Trigger": "Conversation loaded"
    }
  },

  REPLY_TAPPED: {
    event: "reply_tapped",
    fields: {
      "ERMA Puzzle Connection Status": "In Progress",
      "ERMA Puzzle Trigger": "Player tapped Reply"
    }
  },

  OPTION_SELECTED: {
    event: "option_selected",
    fields: (choice) => ({
      "ERMA Puzzle Trigger": "Player selected option",
      "ERMA Puzzle Trigger Response": choice
    })
  },

  EXIT_CODE_GIVEN: {
    event: "exit_code_given",
    fields: {
      "ERMA Puzzle Trigger": "Exit code revealed",
      "ERMA Exit Code": "5291"
    }
  },

  CONVERSATION_ENDED: {
    event: "conversation_ended",
    fields: {
      "ERMA Puzzle Status": "Conversation ended"
    }
  }
};

/* --------------------------------------------------
   Firebase config
-------------------------------------------------- */

const firebaseConfig = {
  apiKey: "AIzaSyBdLzbDjfF0l5iTckIXVV_sziLKEqIyN3s",
  authDomain: "gangster-chase-3fee5.firebaseapp.com",
  databaseURL:
    "https://gangster-chase-3fee5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gangster-chase-3fee5",
  storageBucket: "gangster-chase-3fee5.firebasestorage.app",
  messagingSenderId: "548622776588",
  appId: "1:548622776588:web:d71e2f991ed5a4b2bd3129"
};

/* --------------------------------------------------
   Firebase init
-------------------------------------------------- */

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* --------------------------------------------------
   Session handling
-------------------------------------------------- */

const sessionId =
  sessionStorage.getItem("erma_session") || crypto.randomUUID();

sessionStorage.setItem("erma_session", sessionId);

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

function ermaTimestamp() {
  const d = new Date();
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

/* --------------------------------------------------
   Public logger
-------------------------------------------------- */

export async function ermaLog(eventKey, param) {
  if (!navigator.onLine) return;

  const def = LOG_EVENTS[eventKey];
  if (!def) return;

  const fields =
    typeof def.fields === "function"
      ? def.fields(param)
      : def.fields;

  const payload = {
    event: def.event,
    timestamp: Date.now(),
    sessionId
  };

  // Attach base ERMA fields
  Object.entries(ERMA_BASE_FIELDS).forEach(([key, value]) => {
    payload[key] = value;
  });

  // Attach event-specific fields + timestamps
  Object.entries(fields).forEach(([key, value]) => {
    payload[key] = value;
    payload[`${key} Date`] = ermaTimestamp();
  });

  try {
    await set(push(ref(db, "interactionLogs")), payload);
  } catch (err) {
    // Fail silently – never block gameplay
    console.warn("ERMA log failed", err);
  }
}

/* --------------------------------------------------
   Auto-log page load
-------------------------------------------------- */

ermaLog("PAGE_LOADED");
