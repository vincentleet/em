import { dom } from "./dom.js";
import { openModal, closeModal } from "./ui.js";
import { startEscapeBranch, startPoliceBranch } from "./branches.js";
import { ermaLog } from "./erma.js";

dom.replyBtn.addEventListener("click", () => {
  ermaLog("REPLY_TAPPED");
  openModal();
});

dom.cancelBtn.addEventListener("click", closeModal);

dom.confirmBtn.addEventListener("click", () => {
  const choice = document.querySelector("input[name='decision']:checked");
  if (!choice) return alert("Select an option");

  ermaLog("OPTION_SELECTED", choice.value);

  dom.replyContainer.style.display = "none";
  dom.fakeInput.style.display = "flex";
  closeModal();

  choice.value === "escape"
    ? startEscapeBranch()
    : startPoliceBranch();
});
