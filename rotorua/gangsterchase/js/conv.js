/**
 * Conversation data – threads, steps, branches
 * Flow: Jimmy thread → decision → call_police (Rotorua Police call + chat) or escape_with_jimmy (player message + Jimmy replies)
 */

const CONV = {
  threads: {
    jimmy: {
      id: 'jimmy',
      name: 'Jimmy',
      status: 'online',
      avatarImage: 'assets/images/jimmy.png',
    },
    rotorua_police: {
      id: 'rotorua_police',
      name: 'Rotorua Police',
      status: 'today',
      avatarImage: 'assets/images/rotorua-police.png',
    },
  },

  steps: {
    // Pre-loaded messages (no animation – already there as if sent beforehand)
    j0_batch: {
      id: 'j0_batch',
      threadId: 'jimmy',
      batch: [
        { message: { text: "Hey u guys in the restaurant yet?", from: 'jimmy' } },
        { message: { text: "Whats going on in there, did you find anything yet", from: 'jimmy' } },
        { message: { text: "Hellooo", from: 'jimmy' } },
        { message: { text: "Guys why aren't you responding?", from: 'jimmy' } },
        { missedCall: true },
        { message: { text: "I've been trying to reach you for almost an hour! I tried to get in but the door is locked.", from: 'jimmy' } },
        { message: { text: "I hope you guys found the stolen goods by now! We need to decide what we are doing with them.", from: 'jimmy' } },
        { message: {
          text: "I might be able to get the code to get out of the restaurant from one of the cooks that I know there. Should we try to keep the money for ourselves? Or should we call the police to notify them of what we found? I'm on the fence, you choose, but decide fast before the gangsters get back!",
          from: 'jimmy',
        } },
      ],
      next: 'j8',
    },
    j8: {
      id: 'j8',
      threadId: 'jimmy',
      choices: {
        title: "What do you want to do?",
        options: [
          { label: "Call the police to report what you have found.", branchId: 'call_police' },
          { label: "Respond to Jimmy telling him you want to attempt to escape with the stolen goods.", branchId: 'escape_with_jimmy' },
        ],
      },
    },

    // Branch: Call police → incoming call from Rotorua Police, then chat
    police_call: {
      id: 'police_call',
      threadId: 'rotorua_police',
      triggerCall: true,
      callContact: 'rotorua_police',
      next: 'mp1',
      declineNext: 'police_call_declined',
    },
    police_call_declined: {
      id: 'police_call_declined',
      threadId: 'rotorua_police',
      missedCall: true,
      next: 'mp1',
    },
    mp1: {
      id: 'mp1',
      threadId: 'rotorua_police',
      message: { text: "Thank you for reporting the robbery.", from: 'rotorua_police' },
      typingDuration: 2200,
      pauseAfter: 1400,
      next: 'mp2',
    },
    mp2: {
      id: 'mp2',
      threadId: 'rotorua_police',
      message: { text: "You may exit the restaurant by using the following code: 5291", from: 'rotorua_police' },
      typingDuration: 2800,
      pauseAfter: 1600,
      next: 'mp3',
    },
    mp3: {
      id: 'mp3',
      threadId: 'rotorua_police',
      message: { text: "We have dispatched a police squad to come meet you outside the restaurant.", from: 'rotorua_police' },
      typingDuration: 3000,
      pauseAfter: 1600,
      next: 'mp4',
    },
    mp4: {
      id: 'mp4',
      threadId: 'rotorua_police',
      message: { text: "Please get out of there as quickly as possible for your own safety", from: 'rotorua_police' },
      typingDuration: 2600,
      pauseAfter: 1200,
      next: null,
    },

    // Branch: Escape with Jimmy → player message, then Jimmy replies (no call)
    j9_reply: {
      id: 'j9_reply',
      threadId: 'jimmy',
      message: { text: "Can you find us the code? We found more than we thought we would.", from: 'player' },
      delayBefore: 1000,
      pauseAfter: 1200,
      next: 'j10',
    },
    j10: {
      id: 'j10',
      threadId: 'jimmy',
      message: { text: "Really? That's awesome", from: 'jimmy' },
      typingDuration: 1800,
      pauseAfter: 1400,
      next: 'j11',
    },
    j11: {
      id: 'j11',
      threadId: 'jimmy',
      message: { text: "I've managed to get the code to exit the restaurant from one of the cooks that works there.", from: 'jimmy' },
      typingDuration: 3200,
      pauseAfter: 1600,
      next: 'j12',
    },
    j12: {
      id: 'j12',
      threadId: 'jimmy',
      message: { text: "The code is 5291", from: 'jimmy' },
      typingDuration: 1600,
      pauseAfter: 1400,
      next: 'j13',
    },
    j13: {
      id: 'j13',
      threadId: 'jimmy',
      message: { text: "Hurry up", from: 'jimmy' },
      typingDuration: 1000,
      pauseAfter: 1200,
      next: 'j14',
    },
    j14: {
      id: 'j14',
      threadId: 'jimmy',
      message: { text: "The gangsters are on their way so get out of there", from: 'jimmy' },
      typingDuration: 2600,
      pauseAfter: 1600,
      next: 'j15',
    },
    j15: {
      id: 'j15',
      threadId: 'jimmy',
      message: { text: "I'm waiting outside for you", from: 'jimmy' },
      typingDuration: 2000,
      next: null,
    },
  },

  // Entry points
  startStep: 'j0_batch',
  branches: {
    call_police: 'police_call',
    escape_with_jimmy: 'j9_reply',
  },
};
