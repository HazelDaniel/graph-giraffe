var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var _shadow, _shadow2, _shadow3, _shadow4, _shadow5, _a;
const STYLE_TEMPLATE$5 = `
  :host {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 2rem;
    display: flex;
    width: max-content;
    border-radius: 0.4rem;
    backdrop-filter: blur(2px);
    background-color: #161616e6;
    padding: 1px 4px;
    padding-right: 0;
    z-index: 10;
  }

  :host>.root {
    top: inherit;
    right: inherit;
    bottom: inherit;
    height: inherit;
    width: inherit;
    display: flex;
    flex-direction: inherit;
    cursor: inherit;
    position: static;
  }

  .kebab-subpane {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.6rem;
    background-color: #161616f0;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.15));
    border-radius: 1.2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, 12px) scale(0.85);
    transform-origin: bottom center;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
    z-index: 20;
  }

  .kebab-subpane button {
    width: 1.8rem;
    height: 1.8rem;
  }

  .kebab-subpane.open {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, 0px) scale(1);
  }

  button,a,*[role="button"],*::-webkit-scrollbar-thumb, input[type="radio"], input[type="range"] {
    //cursor: url("data:image/svg+xml,%3Csvg width='38' height='44' viewBox='8 8 38 44' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_322_719)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.6711 24L10.8979 21.2906C9.6871 19.4406 7.10808 18.7658 5.13534 19.78L5.595 19.5436C5.10544 19.7954 4.87068 20.4228 5.07226 20.9442L7.5268 27.2948C7.91592 28.3016 8.90972 29.7254 9.73322 30.4406C9.73322 30.4406 14.6711 34.5278 14.6711 36.06V38H22.671L24.671 34L26.671 38H28.671V36.06C28.671 34.5278 31.6888 29.7014 31.6888 29.7014C32.2442 28.7632 32.7072 27.1104 32.7072 26.0132V17.9436C32.671 16.157 31.1524 14.7091 29.2786 14.7091C28.341 14.7091 27.5818 15.433 27.5818 16.3268V16.9731C27.5818 15.1865 26.063 13.7386 24.1892 13.7386C23.2516 13.7386 22.4924 14.4626 22.4924 15.3564V16.0027C22.4924 14.2161 20.9736 12.7682 19.0998 12.7682C18.1624 12.7682 17.403 13.4921 17.403 14.3859V15.0322C17.403 14.7451 17.3724 14.5169 17.313 14.336L16.7955 6.00242C16.7255 4.87552 15.7757 4 14.6711 4C13.5588 4 12.6711 4.89526 12.6711 5.99962V14V24ZM26.7072 22H28.7072V30H26.7072V22ZM22.7072 22H24.7072V30H22.7072V22ZM18.7072 22H20.7072V30H18.7072V22Z' fill='white'/%3E%3Cmask id='mask0_322_719' style='mask-type:luminance' maskUnits='userSpaceOnUse' x='3' y='2' width='32' height='38'%3E%3Cpath d='M35 2H3V40H35V2Z' fill='white'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.6711 24L10.8979 21.2906C9.6871 19.4406 7.10808 18.7658 5.13534 19.78L5.595 19.5436C5.10544 19.7954 4.87068 20.4228 5.07226 20.9442L7.5268 27.2948C7.91592 28.3016 8.90972 29.7254 9.73322 30.4406C9.73322 30.4406 14.6711 34.5278 14.6711 36.06V38H22.671L24.671 34L26.671 38H28.671V36.06C28.671 34.5278 31.6888 29.7014 31.6888 29.7014C32.2442 28.7632 32.7072 27.1104 32.7072 26.0132V17.9436C32.671 16.157 31.1524 14.7091 29.2786 14.7091C28.341 14.7091 27.5818 15.433 27.5818 16.3268V16.9731C27.5818 15.1865 26.063 13.7386 24.1892 13.7386C23.2516 13.7386 22.4924 14.4626 22.4924 15.3564V16.0027C22.4924 14.2161 20.9736 12.7682 19.0996 12.7682V14.7682C19.96 14.7682 20.4922 15.4095 20.4922 16.0027H24.4922ZM19.0996 10.7682C17.1486 10.7682 15.4028 12.2987 15.4028 14.3859H19.4028C19.4028 14.5225 19.3414 14.6306 19.2798 14.6894C19.2198 14.7466 19.1516 14.7682 19.0996 14.7682V10.7682ZM15.4028 14.3859V15.0322H19.4028V14.3859H15.4028ZM19.4028 15.0322C19.4028 14.6176 19.3604 14.1618 19.2134 13.713L15.4124 14.959C15.3967 14.9111 15.395 14.8887 15.3969 14.9031C15.3988 14.9175 15.4028 14.9582 15.4028 15.0322H19.4028ZM19.309 14.212L18.7914 5.87846L14.7991 6.1264L15.3167 14.46L19.309 14.212ZM18.7914 5.87846C18.6556 3.69008 16.8248 2 14.6709 2V6C14.6886 6 14.7203 6.00692 14.7542 6.03866C14.7864 6.06876 14.7975 6.09952 14.7991 6.1264L18.7914 5.87846ZM14.6709 2C12.4494 2 10.6709 3.79536 10.6709 5.99962L14.6709 6V2ZM10.6709 5.99962V14H14.6709V6L10.6709 5.99962ZM10.6709 14V24H14.6709V14H10.6709ZM26.707 24H28.707V20H26.707V24ZM26.707 22V30H30.707V22H26.707ZM28.707 28H26.707V32H28.707V28ZM28.707 30V22H24.707V30H28.707ZM22.707 24H24.707V20H22.707V24ZM22.707 22V30H26.707V22H22.707ZM24.707 28H22.707V32H24.707V28ZM24.707 30V22H20.707V30H24.707ZM18.707 24H20.707V20H18.707V24ZM18.707 22V30H22.707V22H18.707ZM20.707 28H18.707V32H20.707V28ZM20.707 30V22H16.7071V30H20.707Z' fill='black' fill-opacity='0.8'/%3E%3C/g%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_322_719' x='0.000167847' y='0' width='37.7069' height='44' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='1'/%3E%3CfeGaussianBlur stdDeviation='1.5'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_322_719'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_322_719' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A"), auto !important;
  }

  :host .panel-right, :host .panel-left {
    display: flex;
    height: 2.8rem;
    color: var(--text-main);
    gap: 0.3rem;
    align-items: center;
    position: relative;
  }

  :host .panel-left {
    flex: 1;
    border-right: 1px solid #3f3f3f;
  }

  :host .panel-right {
    padding: 0 0.5rem;
    width: max-content;
    background-color: #ffffff25;
    border-radius: 2px;
  }

  :host button {
    width: 2.4rem;
    height: 2.4rem;
    transform: scale(0.8);
    padding: 0.3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.3rem;
    cursor: pointer;
    transition: background 0.2s linear, transform 0.2s ease;
  }

  :host button:not(.active):hover {
    background-color: #ffffff25;
  }

  :host button svg {
    width: 80%;
    height: 80%;
  }

  :host button.active {
    background-color: var(--accent);
  }

  button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    color: var(--text-main);
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
class ActionPane extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _shadow, this.attachShadow({ mode: "open" }));
  }
  connectedCallback() {
    this.render();
    this.setupListeners();
  }
  setupListeners() {
    const kebabToggle = __privateGet(this, _shadow).querySelector("#btn-kebab-toggle");
    const subpane = __privateGet(this, _shadow).querySelector("#kebab-subpane");
    if (!kebabToggle || !subpane) return;
    kebabToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = subpane.classList.toggle("open");
      kebabToggle.classList.toggle("active", isOpen);
    });
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        subpane.classList.remove("open");
        kebabToggle.classList.remove("active");
      }
    });
  }
  render() {
    __privateGet(this, _shadow).innerHTML = `
    <style>
      ${STYLE_TEMPLATE$5}
    </style>

    ${this.getChildrenTemplate()}
  `;
  }
  getChildrenTemplate() {
    return `
    <div class="root" part="root">
      <!-- Popping Sub-pane for nested items -->
      <div id="kebab-subpane" class="kebab-subpane">
        <button id="btn-create-subgraph" title="Create Subgraph">
          <svg width="100%" height="60%" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.11429 7.89474C4.11429 9.05744 3.19327 10 2.05714 10C0.921014 10 0 9.05744 0 7.89474C0 6.73203 0.921014 5.78947 2.05714 5.78947C3.19327 5.78947 4.11429 6.73203 4.11429 7.89474Z" fill="#D9D9D9"/>
            <path d="M18 4.73684C18 5.89955 17.079 6.84211 15.9429 6.84211C14.8067 6.84211 13.8857 5.89955 13.8857 4.73684C13.8857 3.57414 14.8067 2.63158 15.9429 2.63158C17.079 2.63158 18 3.57414 18 4.73684Z" fill="#D9D9D9"/>
            <path d="M9.77143 1.84211C9.77143 2.85947 8.96554 3.68421 7.97143 3.68421C6.97732 3.68421 6.17143 2.85947 6.17143 1.84211C6.17143 0.824739 6.97732 0 7.97143 0C8.96554 0 9.77143 0.824739 9.77143 1.84211Z" fill="#D9D9D9"/>
            <path d="M0.514286 8.55963L6.61481 2.31641L7.54414 3.26749L1.44362 9.51071L0.514286 8.55963Z" fill="#D9D9D9"/>
            <path d="M16.2689 5.85032L8.31142 2.43907L8.8192 1.19849L16.7767 4.60974L16.2689 5.85032Z" fill="#D9D9D9"/>
          </svg>
        </button>
        <button id="btn-add-branch" title="Add Branch Node">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3V15M6 15C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21C7.65685 21 9 19.6569 9 18C9 16.3431 7.65685 15 6 15ZM18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 7.65685 16.3431 9 18 9ZM6 9C9.5 9 12 12 18 12V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="panel-left">
        <span class="active">
          <svg
            viewBox="0 0 33 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-full scale-75"
          >
            <path
              d="M12.8812 33.4262C12.6148 34.3964 11.2436 34.41 10.958 33.4453L1.5 1.5L30.8157 15.5062C31.6862 15.9221 31.5212 17.2077 30.574 17.3904L20.2034 19.3902C17.9609 19.8227 16.1583 21.4907 15.5536 23.6931L12.8812 33.4262Z"
              stroke="currentColor"
              stroke-width="3"
              stroke-linejoin="round"
            />
          </svg>
        </span>

        <button id="btn-add-node">
          <svg
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M4 6.25A2.25 2.25 0 016.25 4h3a2.25 2.25 0 012.25 2.25V7h3.25a.75.75 0 010 1.5H11.5v.75a2.25 2.25 0 01-2.25 2.25h-3A2.25 2.25 0 014 9.25V8.5H.75a.75.75 0 010-1.5H4v-.75zm6 0a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3z"
                clip-rule="evenodd"
              ></path>
            </g>
          </svg>
        </button>

        <button id="btn-add-composition">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M20.9999 9.88379C21.0033 9.63406 20.8823 9.3827 20.636 9.23825L13.1419 4.84334C12.4534 4.43956 11.6007 4.43847 10.9111 4.84047L3.36938 9.23727C3.12196 9.38152 3.00042 9.63347 3.00386 9.88379H2.99995V14.3148H3.00408C3.01115 14.5585 3.13674 14.7991 3.38001 14.9355L10.9431 19.1778C11.6163 19.5554 12.4378 19.5543 13.11 19.175L20.6253 14.9346C20.8675 14.7979 20.9926 14.5579 20.9996 14.3148L20.9999 9.88379ZM4.76444 10.4474C4.58407 10.3456 4.35534 10.4093 4.25357 10.5897C4.15179 10.7701 4.21551 10.9988 4.39589 11.1006L10.7548 14.6885C11.5471 15.1355 12.516 15.1331 13.306 14.6823L19.5841 11.0997C19.7639 10.997 19.8265 10.768 19.7239 10.5881C19.6212 10.4083 19.3922 10.3456 19.2123 10.4483L12.9343 14.0309C12.3735 14.3509 11.6857 14.3526 11.1234 14.0353L4.76444 10.4474Z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </button>

        <button id="btn-add-group">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.3106 4.81534L19.806 12.3107L12.3106 19.806L4.81531 12.3107L12.3106 4.81534ZM6.93663 12.3107L12.3106 17.6847L17.6847 12.3107L12.3106 6.93666L6.93663 12.3107Z"
                fill="currentColor"
              ></path>
              <circle cx="12" cy="5.5" r="2.5" fill="currentColor"></circle>
              <circle cx="12" cy="18.5" r="2.5" fill="currentColor"></circle>
              <circle cx="5.5" cy="12" r="2.5" fill="currentColor"></circle>
              <circle cx="18.5" cy="12" r="2.5" fill="currentColor"></circle>
            </g>
          </svg>
        </button>

        <button id="btn-delete-node">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M4 7H20"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M6 10L7.70141 19.3578C7.87432 20.3088 8.70258 21 9.66915 21H14.3308C15.2974 21 16.1257 20.3087 16.2986 19.3578L18 10"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </g>
          </svg>
        </button>

        <button id="btn-multi-select">
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M18.2848192,17.5777124 L20.8535534,20.1464466 C21.0488155,20.3417088 21.0488155,20.6582912 20.8535534,20.8535534 C20.6582912,21.0488155 20.3417088,21.0488155 20.1464466,20.8535534 L17.5777124,18.2848192 L15.9160251,20.7773501 C15.6899572,21.116452 15.1749357,21.0571624 15.0318354,20.6755617 L12.0318354,12.6755617 C11.8811067,12.2736185 12.2736185,11.8811067 12.6755617,12.0318354 L20.6755617,15.0318354 C21.0571624,15.1749357 21.116452,15.6899572 20.7773501,15.9160251 L18.2848192,17.5777124 L18.2848192,17.5777124 Z M17.2312404,17.0782479 L19.4104716,15.6254271 L13.3544004,13.3544004 L15.6254271,19.4104716 L17.0782479,17.2312404 C17.0974475,17.2011742 17.1201804,17.1727128 17.1464466,17.1464466 C17.1727128,17.1201804 17.2011742,17.0974475 17.2312404,17.0782479 L17.2312404,17.0782479 Z M5.5,3 C5.77614237,3 6,3.22385763 6,3.5 C6,3.77614237 5.77614237,4 5.5,4 C4.67157288,4 4,4.67157288 4,5.5 C4,5.77614237 3.77614237,6 3.5,6 C3.22385763,6 3,5.77614237 3,5.5 C3,4.11928813 4.11928813,3 5.5,3 Z M8.5,4 C8.22385763,4 8,3.77614237 8,3.5 C8,3.22385763 8.22385763,3 8.5,3 L10.5,3 C10.7761424,3 11,3.22385763 11,3.5 C11,3.77614237 10.7761424,4 10.5,4 L8.5,4 Z M13.5,4 C13.2238576,4 13,3.77614237 13,3.5 C13,3.22385763 13.2238576,3 13.5,3 L15.5,3 C15.7761424,3 16,3.22385763 16,3.5 C16,3.77614237 15.7761424,4 15.5,4 L13.5,4 Z M8.5,21 C8.22385763,21 8,20.7761424 8,20.5 C8,20.2238576 8.22385763,20 8.5,20 L10.5,20 C10.7761424,20 11,20.2238576 11,20.5 C11,20.7761424 10.7761424,21 10.5,21 L8.5,21 Z M3,8.5 C3,8.22385763 3.22385763,8 3.5,8 C3.77614237,8 4,8.22385763 4,8.5 L4,10.5 C4,10.7761424 3.77614237,11 3.5,11 C3.22385763,11 3,10.7761424 3,10.5 L3,8.5 Z M3,13.5 C3,13.2238576 3.22385763,13 3.5,13 C3.77614237,13 4,13.2238576 4,13.5 L4,15.5 C4,15.7761424 3.77614237,16 3.5,16 C3.22385763,16 3,15.7761424 3,15.5 L3,13.5 Z M3,18.5 C3,18.2238576 3.22385763,18 3.5,18 C3.77614237,18 4,18.2238576 4,18.5 C4,19.3284271 4.67157288,20 5.5,20 C5.77614237,20 6,20.2238576 6,20.5 C6,20.7761424 5.77614237,21 5.5,21 C4.11928813,21 3,19.8807119 3,18.5 Z M21,10.5 C21,10.7761424 20.7761424,11 20.5,11 C20.2238576,11 20,10.7761424 20,10.5 L20,8.5 C20,8.22385763 20.2238576,8 20.5,8 C20.7761424,8 21,8.22385763 21,8.5 L21,10.5 Z M21,5.5 C21,5.77614237 20.7761424,6 20.5,6 C20.2238576,6 20,5.77614237 20,5.5 C20,4.67157288 19.3284271,4 18.5,4 C18.2238576,4 18,3.77614237 18,3.5 C18,3.22385763 18.2238576,3 18.5,3 C19.8807119,3 21,4.11928813 21,5.5 Z"
              ></path>
            </g>
          </svg>
        </button>

        <button id="btn-kebab-toggle" title="More Primitives">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>
      <div class="panel-right">
        <button id="btn-play-sim">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M15 5V19M21 5V19M3 7.20608V16.7939C3 17.7996 3 18.3024 3.19886 18.5352C3.37141 18.7373 3.63025 18.8445 3.89512 18.8236C4.20038 18.7996 4.55593 18.4441 5.26704 17.733L10.061 12.939C10.3897 12.6103 10.554 12.446 10.6156 12.2565C10.6697 12.0898 10.6697 11.9102 10.6156 11.7435C10.554 11.554 10.3897 11.3897 10.061 11.061L5.26704 6.26704C4.55593 5.55593 4.20038 5.20038 3.89512 5.17636C3.63025 5.15551 3.37141 5.26273 3.19886 5.46476C3 5.69759 3 6.20042 3 7.20608Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </g>
          </svg>
        </button>
      </div>
    </div>
    `;
  }
}
_shadow = new WeakMap();
if (!customElements.get("gg-action-pane"))
  customElements.define("gg-action-pane", ActionPane);
const STYLE_TEMPLATE$4 = `
  :host {
    position: absolute;
    top: 0.8rem;
    left: 2rem;
    display: flex;
    padding: 0.8rem 1rem;
    gap: 0.8rem;
    z-index: 10;
  }

  :host>.root {
    top: inherit;
    right: inherit;
    left: inherit;
    bottom: inherit;
    height: inherit;
    width: inherit;
    display: flex;
    flex-direction: inherit;
    gap: inherit;
  }

  :host button {
    border-radius: 1rem;
    cursor: pointer;
  }

  :host button::selection {
    background: transparent;
  }

  button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    color: var(--text-main);
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

`;
class HistoryPane extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _shadow2, this.attachShadow({ mode: "open" }));
  }
  connectedCallback() {
    this.render();
  }
  render() {
    __privateGet(this, _shadow2).innerHTML = `
    <style>
      ${STYLE_TEMPLATE$4}
    </style>

    ${this.getChildrenTemplate()}
  `;
  }
  getChildrenTemplate() {
    return `
    <div class="root" part="root">
      <button id="btn-undo" class="secondary" disabled>Undo</button>
      <button id="btn-redo" class="secondary" disabled>Redo</button>
    </div>
    `;
  }
}
_shadow2 = new WeakMap();
if (!customElements.get("gg-history-pane"))
  customElements.define("gg-history-pane", HistoryPane);
const STYLE_TEMPLATE$3 = `
  :host {
    position: absolute;
    top: 0.8rem;
    left: 12.2rem;
    display: inline-flex;
    padding: 0.8rem 0;
    z-index: 10;
  }

  .root {
    position: relative;
    display: inline-flex;
  }

  button.kebab-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.15));
    color: var(--text-main, #f8fafc);
    width: 42px;
    height: 42px;
    padding: 0;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    outline: none;
  }

  button.kebab-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--accent, #38bdf8);
  }

  button.kebab-button:active {
    transform: scale(0.96);
  }

  button.kebab-button.active {
    background: rgba(255, 255, 255, 0.12);
    border-color: var(--accent, #38bdf8);
    color: var(--accent, #38bdf8);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    min-width: 150px;
    background: rgba(22, 22, 22, 0.94);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.15));
    border-radius: 8px;
    padding: 6px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 100;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  .dropdown-menu.hidden {
    display: none;
    opacity: 0;
    pointer-events: none;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    width: 100%;
    border: none;
    background: transparent;
    color: var(--text-main, #f8fafc);
    font-size: 0.85rem;
    font-family: inherit;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease, color 0.15s ease;
    box-sizing: border-box;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--accent, #38bdf8);
  }

  .menu-item svg {
    flex-shrink: 0;
    opacity: 0.85;
  }

  .menu-item:hover svg {
    opacity: 1;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
class KebabMenu extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _shadow3, this.attachShadow({ mode: "open" }));
    __publicField(this, "isOpen", false);
    __publicField(this, "handleOutsideClick", (e) => {
      if (!this.isOpen) return;
      const path = e.composedPath();
      if (!path.includes(this)) {
        this.close();
      }
    });
  }
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.handleOutsideClick);
  }
  setupEventListeners() {
    const btn = __privateGet(this, _shadow3).querySelector("#btn-kebab");
    btn == null ? void 0 : btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });
    const dropdown = __privateGet(this, _shadow3).querySelector("#kebab-dropdown");
    dropdown == null ? void 0 : dropdown.addEventListener("click", (e) => {
      const target = e.target;
      const button = target == null ? void 0 : target.closest(
        "button[data-action]"
      );
      if (!button) return;
      const action = button.dataset.action;
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      this.close();
      this.dispatchEvent(
        new CustomEvent("gg-kebab-action", {
          detail: { action },
          bubbles: true,
          composed: true
        })
      );
    });
    document.addEventListener("pointerdown", this.handleOutsideClick);
  }
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    const dropdown = __privateGet(this, _shadow3).querySelector("#kebab-dropdown");
    const btn = __privateGet(this, _shadow3).querySelector("#btn-kebab");
    dropdown == null ? void 0 : dropdown.classList.remove("hidden");
    btn == null ? void 0 : btn.classList.add("active");
    btn == null ? void 0 : btn.setAttribute("aria-expanded", "true");
  }
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    const dropdown = __privateGet(this, _shadow3).querySelector("#kebab-dropdown");
    const btn = __privateGet(this, _shadow3).querySelector("#btn-kebab");
    dropdown == null ? void 0 : dropdown.classList.add("hidden");
    btn == null ? void 0 : btn.classList.remove("active");
    btn == null ? void 0 : btn.setAttribute("aria-expanded", "false");
  }
  render() {
    __privateGet(this, _shadow3).innerHTML = `
      <style>${STYLE_TEMPLATE$3}</style>
      <div class="root" part="root">
        <button
          id="btn-kebab"
          class="kebab-button"
          type="button"
          aria-label="More options"
          aria-expanded="false"
          aria-haspopup="true"
          title="More options"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2.25" fill="currentColor"/>
            <circle cx="12" cy="12" r="2.25" fill="currentColor"/>
            <circle cx="12" cy="19" r="2.25" fill="currentColor"/>
          </svg>
        </button>
        <div id="kebab-dropdown" class="dropdown-menu hidden" role="menu" aria-label="Options menu">
          <button type="button" class="menu-item" data-action="import" role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Import</span>
          </button>
          <button type="button" class="menu-item" data-action="export" role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>
    `;
  }
}
_shadow3 = new WeakMap();
if (!customElements.get("gg-kebab-menu")) {
  customElements.define("gg-kebab-menu", KebabMenu);
}
const STYLE_TEMPLATE$2 = `
  :host {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
    color: rgb(26, 29, 29);
  }
  
  :host>div {
    width: 8rem;
    height: 8rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host>div svg {
    width: 100%;
    height: 100%;
    animation: flip 0.8s linear infinite;
    animation-timing-function: none;
  }

  @keyframes flip {
    0% {
      transform: scaleX(1);
    }
    
    49.9999% {
    transform: scaleX(1)
    }

    50% {
      transform: scaleX(-1);
    }
    99.9999% {
    transform: scaleX(-1)
    }

    100% {
      transform: scaleX(1);
    }
  }
`;
class LoadingScreen extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "done", true);
    __publicField(this, "activePromiseIndex", -1);
    __publicField(this, "promises", []);
    this.attachShadow({ mode: "open" });
  }
  set promise(newPromise) {
    this.activePromiseIndex++;
    this.stop();
    this.done = false;
    this.toggleHidden(false);
    this.promises.push(newPromise);
    const activeIndex = this.activePromiseIndex;
    newPromise.finally(() => {
      if (activeIndex < this.activePromiseIndex) return;
      this.stop();
    });
    Promise.allSettled(this.promises).then((el) => {
      if (el.length && el.length < this.promises.length) return;
      this.stop();
    }).catch((_) => {
      this.stop();
    });
  }
  connectedCallback() {
    if (!this.promises.length) return;
    this.render();
  }
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${STYLE_TEMPLATE$2}
      </style>

      <div part="root">

        <svg width="100%" height="100%" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50.6929 13.1332C46.8618 10.7433 42.5809 13.3801 39.3505 14.7219C36.1201 16.0681 35.531 15.2565 35.531 15.2565L33.272 12.5579C31.8695 11.4029 33.272 12.5579 31.8695 11.4029C31.1768 10.9722 30.4583 10.7358 29.7226 10.7358C28.7928 10.7358 27.8918 11.1093 27.0311 11.7794C26.3126 10.394 25.6831 9.11549 25.1759 8.04933C24.3927 6.41093 23.7647 5.08124 23.7202 5.10684C23.6771 5.13244 24.2821 4.50449 24.4171 3.46242C24.499 2.84953 24.4028 2.20953 24.1053 1.62073C23.3552 0.134432 21.592 -0.433283 20.1736 0.355797C18.7524 1.14488 18.2121 2.98807 18.9666 4.47738C19.264 5.06618 19.7167 5.50891 20.2455 5.78147C21.1465 6.24529 21.9843 6.07211 21.9455 6.09319C21.9067 6.11427 22.6252 7.39276 23.509 8.97394C24.3237 10.4316 25.0509 11.799 25.699 13.079C25.1342 13.7491 24.5953 14.5442 24.0794 15.4387L24.1283 15.2565C24.1283 15.2565 23.5406 16.0666 20.3102 14.7219C17.0798 13.3786 12.7989 10.7418 8.96785 13.1347C5.62967 15.2218 1.97392 16.8753 0.518229 19.89C0.160414 20.6324 0.467934 21.8115 1.14189 22.2498C1.76555 22.6548 2.64931 23.0705 3.79317 23.2301C6.30076 23.581 7.88434 25.4573 10.3905 25.8081C12.8966 26.159 17.1157 25.4769 18.3486 24.3776C19.3201 23.5132 20.4093 21.7197 21.6667 20.9261C20.211 25.1621 19.2252 30.1601 18.9062 34.7982C18.8502 35.628 19.3847 35.9683 20.1061 35.622C22.1926 34.6175 25.0408 33.7411 28.6434 33.7411C28.7224 33.7411 28.7971 33.7411 28.8762 33.7426C33.1829 33.7863 36.83 35.1837 39.3807 36.5496C40.0863 36.9291 40.6309 36.5978 40.5921 35.7665C40.3507 30.8077 39.3089 25.3353 37.7224 20.7695C39.0962 21.4562 40.2717 23.4484 41.3135 24.3776C42.5479 25.4769 46.7655 26.159 49.2717 25.8081C51.7778 25.4573 53.3628 23.581 55.869 23.2301C58.3751 22.8792 59.6325 21.3026 59.6325 21.3026C58.7617 17.3496 54.521 15.5245 50.6929 13.1332ZM26.3557 24.3324C25.7607 24.3324 25.2779 23.8264 25.2779 23.203C25.2779 22.5795 25.7607 22.0736 26.3557 22.0736C26.9506 22.0736 27.4334 22.5795 27.4334 23.203C27.4334 23.8264 26.9506 24.3324 26.3557 24.3324ZM32.7029 24.3324C32.108 24.3324 31.6252 23.8264 31.6252 23.203C31.6252 22.5795 32.108 22.0736 32.7029 22.0736C33.2979 22.0736 33.7807 22.5795 33.7807 23.203C33.7807 23.8264 33.2979 24.3324 32.7029 24.3324Z" fill="url(#paint0_linear_13_114)"/>
        <path d="M4.52021 48.2205C6.10549 48.2205 7.52021 49.5967 7.52021 51.4578C7.51998 53.3187 6.10536 54.6941 4.52021 54.6941C2.93506 54.6941 1.52044 53.3187 1.52021 51.4578C1.52021 49.5967 2.93493 48.2205 4.52021 48.2205Z" stroke="currentColor" stroke-width="3"/>
        <circle cx="55.5" cy="51.0263" r="3" stroke="currentColor" stroke-width="3"/>
        <path d="M6.06371 50.0263H17.5853M17.5853 50.0263H31.0045M17.5853 50.0263L18.6916 52.6645C21.4623 59.2715 31.0045 57.227 31.0045 50.0263M17.5853 50.0263L14.5916 42.8875C12.1425 37.0473 16.2856 30.5263 22.4452 30.5263H38.1587C43.0408 30.5263 46.4888 35.4677 44.9466 40.2542L41.798 50.0263M31.0045 50.0263H41.798M31.0045 50.0263C31.0045 56.1874 39.3619 57.5873 41.2454 51.7416L41.798 50.0263M41.798 50.0263H53.4341M31.0045 50.5263V31.5263" stroke="currentColor" stroke-width="4"/>
        <defs>
        <linearGradient id="paint0_linear_13_114" x1="29.4977" y1="26.3158" x2="30.0493" y2="0.00103347" gradientUnits="userSpaceOnUse">
        <stop stop-color="currentColor"/>
        <stop offset="1" stop-color="#2C9F92"/>
        </linearGradient>
        </defs>
        </svg>


      </div>
    `;
  }
  toggleHidden(hidden) {
    this.hidden = hidden ?? !this.hidden;
    this.render();
  }
  stop() {
    if (this.done) return;
    this.done = true;
    this.toggleHidden(true);
  }
  disconnectedCallback() {
    this.stop();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "hidden":
        if ((newValue === "true" || !newValue && typeof newValue === "string") && newValue !== oldValue) {
          this.stop();
          this.style.display = "none";
        } else {
          if (newValue === oldValue) return;
          this.style.display = "flex";
        }
        break;
    }
  }
}
__publicField(LoadingScreen, "observedAttributes", ["hidden"]);
if (!customElements.get("gg-loading-screen"))
  customElements.define("gg-loading-screen", LoadingScreen);
class GGInputPair extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #e2e8f0;
          gap: 0.4rem;
        }
        :host(.row) {
          flex-direction: row;
        }
        label {
          flex: 1;
          margin-right: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .control-container {
          flex: 2;
          display: flex;
          justify-content: flex-end;
        }
        ::slotted(input[type="text"]) {
          width: 100%;
          background: #1e293b;
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 4px;
          padding: 4px 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          box-sizing: border-box;
        }
        ::slotted(input[type="checkbox"]) {
          accent-color: #2C9F92;
          width: 16px;
          height: 16px;
          border-radius: 0.8rem;
        }

        ::slotted(input[type="range"]) {
          min-width: 12rem;
          accent-color: #2C9F92;
        }
        ::slotted(gg-select) {
          width: 100%;
        }
      </style>
      <label id="lbl"></label>
      <div class="control-container">
        <slot></slot>
      </div>
    `;
  }
  set label(text) {
    this.shadowRoot.getElementById("lbl").textContent = text;
  }
}
customElements.define("gg-input-pair", GGInputPair);
class GGInputGroup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 16px;
        }
        fieldset {
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 12px;
          margin: 0;
          background:rgba(44, 159, 146, 0.1);
        }
        legend {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0 4px;
        }
      </style>
      <fieldset>
        <legend id="leg"></legend>
        <slot></slot>
      </fieldset>
    `;
  }
  set legend(text) {
    this.shadowRoot.getElementById("leg").textContent = text;
  }
}
customElements.define("gg-input-group", GGInputGroup);
class GGPropGroup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px 0;
          max-height: 100%;
          box-sizing: border-box;
          width: 100%;
          overflow: hidden;
        }

        :host>#container {
          width: 100%;
          overflow-y: auto;
        }
      </style>
      <div id="container" part="root"></div>
    `;
  }
  /**
   * Generates the DOM based on the NodePropType data.
   * Returns the estimated height of the WebGL node body based on the properties.
   */
  useProps(data) {
    const container = this.shadowRoot.getElementById("container");
    container.innerHTML = "";
    let lineCount = 0;
    const createControl = (primitive) => {
      const { label, value, uiPrimitive, options } = primitive;
      let control;
      if (uiPrimitive === "select") {
        control = document.createElement("gg-select");
        control.setAttribute("value", value);
        if (Array.isArray(options)) {
          for (const option of options) {
            const optionTemplate = `<gg-option value="${option}">${option}</gg-option>`;
            control.insertAdjacentHTML("beforeend", optionTemplate);
          }
        }
        control.addEventListener("gg-select-change", (e) => {
          this.dispatchPropChange(label, e.target.value, uiPrimitive);
        });
      } else {
        const input = document.createElement("input");
        input.type = uiPrimitive === "checkbox" ? "checkbox" : uiPrimitive;
        if (uiPrimitive === "checkbox") {
          input.checked = value;
          input.addEventListener("change", (e) => {
            this.dispatchPropChange(label, input.checked, uiPrimitive);
          });
        } else {
          input.value = value;
          input.addEventListener("change", (e) => {
            this.dispatchPropChange(label, input.value, uiPrimitive);
          });
        }
        control = input;
      }
      return control;
    };
    const createPair = (primitive) => {
      const pair = document.createElement("gg-input-pair");
      if ("uiPrimitive" in primitive && primitive["uiPrimitive"] === "checkbox")
        pair.classList.add("row");
      pair.label = primitive.label;
      const control = createControl(primitive);
      pair.appendChild(control);
      return pair;
    };
    const ungrouped = [
      ...data.booleans["ungrouped"] || [],
      ...data.texts["ungrouped"] || [],
      ...data.enums["ungrouped"] || []
    ];
    for (const item of ungrouped) {
      container.appendChild(createPair(item));
      lineCount++;
    }
    for (const groupName of data.groups) {
      const groupItems = [
        ...data.booleans[groupName] || [],
        ...data.texts[groupName] || [],
        ...data.enums[groupName] || []
      ];
      if (groupItems.length > 0) {
        const groupEl = document.createElement("gg-input-group");
        groupEl.legend = groupName;
        lineCount++;
        for (const item of groupItems) {
          groupEl.appendChild(createPair(item));
          lineCount++;
        }
        container.appendChild(groupEl);
      }
    }
    return 30 + 16 + lineCount * 20 + 16 + 8 * data.groups.length;
  }
  dispatchPropChange(label, value, uiPrimitive) {
    const payload = { label, value, uiPrimitive };
    this.dispatchEvent(
      new CustomEvent("gg-prop-change", {
        detail: payload,
        bubbles: true,
        composed: true
      })
    );
  }
}
customElements.define("gg-prop-group", GGPropGroup);
const STYLES$1 = (
  /* css */
  `
  *, *::before, *::after { box-sizing: border-box; }

  :host {
    display: inline-block;
    width: 100%;
    position: relative;
    font-family: inherit;
    min-width: 200px;
    --cs-radius:        8px;
    --cs-border:rgba(77, 77, 77, 0.25);
    --cs-border-focus:rgba(75, 75, 75, 0.15);
    --cs-focus-ring:    rgba(92, 92, 95, 0.22);
    --cs-text:rgb(235, 235, 235);
    --cs-placeholder:   #9ca3af;
    --cs-surface: var(--material-surface);
    --cs-hover-bg:rgba(36, 37, 39, 0.36);
    --cs-selected-bg:   #eef2ff;
    --cs-selected-text: #3b82f6;
    --cs-selected-mark: #3b82f6;
    --cs-shadow:        0 8px 24px -4px rgba(0,0,0,.12), 0 3px 8px -2px rgba(0,0,0,.07);
    --cs-accent: #3b82f6;
  }
  :host([disabled]) { opacity: .45; pointer-events: none; }

  /* ── Trigger ── */
  .trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 14px;
    background: var(--cs-surface);
    border: 1.5px solid var(--cs-border);
    border-radius: var(--cs-radius);
    font-size: 14px;
    font-weight: 500;
    color: var(--cs-text);
    cursor: pointer;
    user-select: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .trigger:hover { border-color: #9ca3af; }
  .trigger:focus-visible {
    outline: none;
    border-color: var(--cs-border-focus);
    box-shadow: 0 0 0 3px var(--cs-focus-ring);
  }
  .trigger[aria-expanded="true"] {
    border-color: var(--cs-border-focus);
    box-shadow: 0 0 0 3px var(--cs-focus-ring);
  }

  .trigger-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
  .trigger-label.is-placeholder {
    color: var(--cs-placeholder);
    font-weight: 400;
  }

  /* ── Chevron ── */
  .chevron {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    color: #6b7280;
    transition: transform .2s ease;
  }
  .trigger[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  /* ── Dropdown ── */
  .dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 9999;
    background: var(--cs-surface);
    outline: 1.5px solid rgba(109, 109, 109, 0.76);
    border: 2px solid transparent;
    border-radius: var(--cs-radius);
    box-shadow: var(--cs-shadow);
    padding: 5px;
    margin: 0;
    list-style: none;
    max-height: 260px;
    overflow-y: auto;
    transform-origin: top center;
    animation: pop-in .13s ease both;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    backdrop-filter: blur(8px);
  }
  .dropdown[hidden] { display: none; }

  @keyframes pop-in {
    from { opacity: 0; transform: scaleY(.94) translateY(-4px); }
    to   { opacity: 1; transform: scaleY(1)  translateY(0);     }
  }

  /* ── Option rows ── */
  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.3rem 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--cs-text);
    cursor: pointer;
    transition: background .1s linear;
  }
  .option:hover,
  .option[data-active] { background: var(--cs-accent); }

  .option[aria-selected="true"] {
    background: var(--cs-selected-bg);
    color: var(--cs-selected-text);
    font-weight: 500;
  }
  .option[aria-selected="true"]:hover,
  .option[aria-selected="true"][data-active] { background: #e0e7ff; }

  .option[aria-disabled="true"] {
    color: #d1d5db;
    cursor: not-allowed;
    pointer-events: none;
  }

  .option-text { flex: 1; }

  /* Checkmark */
  .check {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: var(--cs-selected-mark);
    visibility: hidden;
  }
  .option[aria-selected="true"] .check { visibility: visible; }

  /* Scrollbar */
  .dropdown::-webkit-scrollbar { width: 5px; }
  .dropdown::-webkit-scrollbar-track { background: transparent; }
  .dropdown::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
`
);
const CHEVRON_SVG$1 = (
  /* html */
  `
  <svg class="chevron" viewBox="0 0 16 16" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.75"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
);
const CHECK_SVG$1 = (
  /* html */
  `
  <svg class="check" viewBox="0 0 14 14" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="currentColor" stroke-width="1.75"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
);
class CustomSelect extends HTMLElement {
  // ── Lifecycle ────────────────────────────────────────────────────────────
  constructor() {
    super();
    // Shadow-DOM refs (populated in connectedCallback)
    __publicField(this, "triggerEl");
    __publicField(this, "triggerLabelEl");
    __publicField(this, "dropdownEl");
    __publicField(this, "isOpen", false);
    __publicField(this, "activeIdx", -1);
    __publicField(this, "slotObserver", null);
    __publicField(this, "onDocClick");
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
    this.cacheRefs();
    this.bindEvents();
    this.syncFromSlot();
    this.slotObserver = new MutationObserver(() => this.syncFromSlot());
    this.slotObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["value", "disabled", "selected"]
    });
  }
  disconnectedCallback() {
    var _a2;
    (_a2 = this.slotObserver) == null ? void 0 : _a2.disconnect();
    document.removeEventListener("click", this.onDocClick, true);
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal || !this.triggerEl) return;
    switch (name) {
      case "placeholder":
        this.updateTriggerLabel();
        break;
      case "value":
        this.refreshOptionStates();
        this.updateTriggerLabel();
        break;
      case "disabled":
        this.triggerEl.disabled = this.disabled;
        break;
    }
  }
  // ── Public API ───────────────────────────────────────────────────────────
  get value() {
    return this.getAttribute("value") ?? "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  get name() {
    return this.getAttribute("name") ?? "";
  }
  get placeholder() {
    return this.getAttribute("placeholder") ?? "Select an option";
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  // ── Render ───────────────────────────────────────────────────────────────
  render() {
    this.shadowRoot.innerHTML = /* html */
    `
      <style>${STYLES$1}</style>
      <button
        class="trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="false"
        ${this.disabled ? "disabled" : ""}
      >
        <span class="trigger-label is-placeholder">${this.placeholder}</span>
        ${CHEVRON_SVG$1}
      </button>
      <ul class="dropdown" role="listbox" hidden></ul>
      <slot style="display:none"></slot>
    `;
  }
  cacheRefs() {
    this.triggerEl = this.shadowRoot.querySelector(".trigger");
    this.triggerLabelEl = this.shadowRoot.querySelector(".trigger-label");
    this.dropdownEl = this.shadowRoot.querySelector(".dropdown");
  }
  // ── Events ───────────────────────────────────────────────────────────────
  bindEvents() {
    this.triggerEl.addEventListener("click", () => this.toggleDropdown());
    this.triggerEl.addEventListener("keydown", (e) => this.onTriggerKeydown(e));
    this.dropdownEl.addEventListener("pointermove", (e) => {
      const opt = e.target.closest(".option");
      if (opt) this.setActive(Number(opt.dataset["idx"]));
    });
    this.dropdownEl.addEventListener("click", (e) => {
      const opt = e.target.closest(".option");
      if (opt && opt.getAttribute("aria-disabled") !== "true") {
        this.selectByIdx(Number(opt.dataset["idx"]));
        this.closeDropdown();
        this.triggerEl.focus();
      }
    });
    this.dropdownEl.addEventListener(
      "keydown",
      (e) => this.onDropdownKeydown(e)
    );
    this.onDocClick = (e) => {
      if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) {
        this.closeDropdown();
      }
    };
    document.addEventListener("click", this.onDocClick, true);
  }
  syncFromSlot() {
    const options = this.getOptions();
    this.dropdownEl.innerHTML = options.map(
      (opt, i) => (
        /* html */
        `
          <li
            class="option"
            role="option"
            data-idx="${i}"
            data-value="${this.escAttr(opt.value)}"
            aria-selected="${opt.value === this.value ? "true" : "false"}"
            aria-disabled="${opt.disabled ? "true" : "false"}"
          >
            <span class="option-text">${opt.label}</span>
            ${CHECK_SVG$1}
          </li>`
      )
    ).join("");
    this.updateTriggerLabel();
  }
  selectByIdx(idx) {
    const options = this.getOptions();
    const chosen = options[idx];
    if (!chosen || chosen.disabled) return;
    this.setAttribute("value", chosen.value);
    this.refreshOptionStates();
    this.updateTriggerLabel();
    const detail = {
      value: chosen.value,
      label: chosen.label,
      name: this.name
    };
    this.dispatchEvent(
      new CustomEvent("gg-select-change", {
        bubbles: true,
        composed: true,
        // escapes Shadow DOM
        detail
      })
    );
  }
  refreshOptionStates() {
    const val = this.value;
    this.dropdownEl.querySelectorAll(".option").forEach((li) => {
      li.setAttribute(
        "aria-selected",
        li.dataset["value"] === val ? "true" : "false"
      );
    });
  }
  updateTriggerLabel() {
    const options = this.getOptions();
    const match = options.find((o) => o.value === this.value);
    if (match) {
      this.triggerLabelEl.textContent = match.label;
      this.triggerLabelEl.classList.remove("is-placeholder");
    } else {
      this.triggerLabelEl.textContent = this.placeholder;
      this.triggerLabelEl.classList.add("is-placeholder");
    }
  }
  toggleDropdown() {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }
  openDropdown() {
    this.isOpen = true;
    this.triggerEl.setAttribute("aria-expanded", "true");
    this.dropdownEl.removeAttribute("hidden");
    const items = this.dropdownItems();
    let startIdx = 0;
    items.forEach((item, i) => {
      if (item.getAttribute("aria-selected") === "true") startIdx = i;
    });
    this.setActive(startIdx);
  }
  closeDropdown() {
    this.isOpen = false;
    this.triggerEl.setAttribute("aria-expanded", "false");
    this.dropdownEl.setAttribute("hidden", "");
    this.clearActive();
  }
  // ── Keyboard ─────────────────────────────────────────────────────────────
  onTriggerKeydown(e) {
    const handled = ["ArrowDown", "ArrowUp", "Enter", " "];
    if (!handled.includes(e.key)) return;
    e.preventDefault();
    if (!this.isOpen) {
      this.openDropdown();
      return;
    }
    if (e.key === "ArrowDown") this.moveActive(1);
    else if (e.key === "ArrowUp") this.moveActive(-1);
    else if (e.key === "Enter" || e.key === " ") {
      if (this.activeIdx >= 0) {
        this.selectByIdx(this.activeIdx);
        this.closeDropdown();
      }
    }
  }
  onDropdownKeydown(e) {
    if (e.key === "Escape") {
      this.closeDropdown();
      this.triggerEl.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.moveActive(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (this.activeIdx >= 0) {
        this.selectByIdx(this.activeIdx);
        this.closeDropdown();
        this.triggerEl.focus();
      }
    } else if (e.key === "Tab") {
      this.closeDropdown();
    }
  }
  // ── Active item ──────────────────────────────────────────────────────────
  setActive(idx) {
    const items = this.dropdownItems();
    this.clearActive();
    if (idx < 0 || idx >= items.length) return;
    this.activeIdx = idx;
    items[idx].setAttribute("data-active", "");
    items[idx].scrollIntoView({ block: "nearest" });
  }
  clearActive() {
    this.dropdownItems().forEach((li) => li.removeAttribute("data-active"));
    this.activeIdx = -1;
  }
  moveActive(dir) {
    const items = this.dropdownItems();
    const len = items.length;
    if (!len) return;
    let next = ((this.activeIdx + dir) % len + len) % len;
    let guard = 0;
    while (items[next].getAttribute("aria-disabled") === "true" && guard < len) {
      next = (next + dir + len) % len;
      guard++;
    }
    this.setActive(next);
  }
  // ── Helpers ──────────────────────────────────────────────────────────────
  dropdownItems() {
    return [...this.dropdownEl.querySelectorAll(".option")];
  }
  getOptions() {
    return [...this.querySelectorAll("gg-option")].map((el) => {
      var _a2, _b;
      return {
        value: el.getAttribute("value") ?? ((_a2 = el.textContent) == null ? void 0 : _a2.trim()) ?? "",
        label: ((_b = el.textContent) == null ? void 0 : _b.trim()) ?? "",
        disabled: el.hasAttribute("disabled")
      };
    });
  }
  escAttr(str) {
    return str.replace(/"/g, "&quot;");
  }
}
__publicField(CustomSelect, "observedAttributes", [
  "placeholder",
  "value",
  "disabled",
  "name"
]);
if (!customElements.get("gg-select")) {
  customElements.define("gg-select", CustomSelect);
}
const STYLE_TEMPLATE$1 = `
  :host {
    position: absolute;
    display: none;
    z-index: 10;
    pointer-events: auto;
    left: 0;
    top: 0;
    transform: translate(-86%, calc(-100% - 16px));
    contain: layout style paint;
    will-change: transform, left, top;
  }

  :host>.root {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem;
    border-radius: 0.45rem;
    background: rgba(18, 18, 18, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
  }

  button {
    width: 2rem;
    height: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.35rem;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(248, 250, 252, 0.96);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: 600 0.85rem/1 Inter, sans-serif;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.22);
  }

  button:active {
    transform: translateY(1px);
  }

  button span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
class SelectionToolbar extends HTMLElement {
  constructor() {
    super();
    __privateAdd(this, _shadow4, this.attachShadow({ mode: "open" }));
    __publicField(this, "actions", []);
    __publicField(this, "visible", false);
    __publicField(this, "posX", 0);
    __publicField(this, "posY", 0);
    __publicField(this, "actionSignature", "");
    __privateGet(this, _shadow4).addEventListener("click", (e) => {
      const target = e.target;
      const button = target == null ? void 0 : target.closest(
        "button[data-action]"
      );
      if (!button) return;
      const action = button.dataset.action;
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("gg-selection-toolbar-action", {
          detail: { action },
          bubbles: true,
          composed: true
        })
      );
    });
  }
  connectedCallback() {
    this.render();
  }
  setActions(actions) {
    const signature = actions.map((action) => action.action).join("|");
    if (signature === this.actionSignature) return;
    this.actionSignature = signature;
    this.actions = actions;
    this.render();
  }
  setPosition(screenX, screenY) {
    if (this.posX === screenX && this.posY === screenY) return;
    this.posX = screenX;
    this.posY = screenY;
    this.style.left = `${Math.round(screenX)}px`;
    this.style.top = `${Math.round(screenY)}px`;
  }
  show() {
    if (this.visible) return;
    this.visible = true;
    this.style.display = "block";
  }
  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.style.display = "none";
  }
  render() {
    __privateGet(this, _shadow4).innerHTML = `
      <style>${STYLE_TEMPLATE$1}</style>
      <div class="root" part="root" aria-label="Selection actions" role="toolbar">
        ${this.actions.map(
      (action) => `
              <button
                type="button"
                data-action="${action.action}"
                aria-label="${action.label}"
                title="${action.label}"
              >
                <span aria-hidden="true">${action.glyph}</span>
                <span class="sr-only">${action.label}</span>
              </button>
            `
    ).join("")}
      </div>
    `;
    this.setPosition(this.posX, this.posY);
    if (!this.visible) {
      this.style.display = "none";
    }
  }
}
_shadow4 = new WeakMap();
if (!customElements.get("gg-selection-toolbar")) {
  customElements.define("gg-selection-toolbar", SelectionToolbar);
}
const PI = 3.141592653589793;
if (typeof CanvasRenderingContext2D.prototype.roundRect !== "function") {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    if (typeof radii === "number") radii = [radii, radii, radii, radii];
    if (!Array.isArray(radii)) radii = [0, 0, 0, 0];
    let tl = radii[0] || 0;
    let tr = radii[1] !== void 0 ? radii[1] : tl;
    let br = radii[2] !== void 0 ? radii[2] : tr;
    let bl = radii[3] !== void 0 ? radii[3] : tl;
    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.arcTo(x + w, y, x + w, y + tr, tr);
    this.lineTo(x + w, y + h - br);
    this.arcTo(x + w, y + h, x + w - br, y + h, br);
    this.lineTo(x + bl, y + h);
    this.arcTo(x, y + h, x, y + h - bl, bl);
    this.lineTo(x, y + tl);
    this.arcTo(x, y, x + tl, y, tl);
    this.closePath();
    return this;
  };
}
const dumbGlyphHeight = 16;
const dumbGlyphWidth = 16;
const NODE_LAYOUT = {
  headerHeight: 30,
  padding: 10,
  closeBtnPaddingRight: 20,
  closeBtnClickRadius: 15,
  editBtnPaddingRight: 45,
  editBtnClickRadius: 15,
  plusBtnPaddingBottom: 20,
  plusBtnClickRadius: 12,
  spotlightBtnPaddingRight: 20,
  spotlightBtnPaddingBottom: 20,
  spotlightBtnClickRadius: 12,
  lockBtnTopY: 20,
  // matches group header titleY
  lockBtnClickRadius: 12,
  subgraphBtnPaddingRight: 18,
  subgraphBtnSpacing: 24,
  subgraphBtnClickRadius: 12
};
const HANDLE_LAYOUT = {
  sideInset: 8,
  offsetX: -2,
  offsetY: -2
};
const DEFAULT_HANDLE_STYLE = {
  shape: "circle",
  backgroundColor: "rgba(33, 36, 39, 0.95)",
  connectedBorderColor: "#2C9F92",
  disconnectedBorderColor: "rgba(148, 163, 184, 0.85)",
  borderWidth: 2,
  size: 12
};
const NODE_SIZE = {
  node: { width: 190, height: 150 },
  hub: { width: 240, height: 100 },
  branch: { width: 140, height: 120 },
  nodeCollapsed: { width: 190, height: NODE_LAYOUT.headerHeight },
  group: { width: 220, height: 200 },
  composition: { width: 140, height: 200 },
  compositionChild: { width: 160, height: NODE_LAYOUT.headerHeight },
  subgraph: { width: 220, height: 160 },
  subgraphCollapsed: { width: 190, height: NODE_LAYOUT.headerHeight }
};
function isContainerNodeType(nodeType, registry) {
  if (registry) return registry.isContainer(nodeType);
  return nodeType === "group" || nodeType === "composition" || nodeType === "subgraph";
}
function isLeafNodeType(nodeType, registry) {
  if (registry) return registry.isLeaf(nodeType);
  return nodeType === "node" || nodeType === "hub" || nodeType === "branch" || nodeType === "composition-child";
}
function isNodePrimitiveType(nodeType, registry) {
  if (registry) {
    const desc = registry.get(nodeType);
    return desc ? desc.category === "leaf" && desc.handles.always : false;
  }
  return nodeType === "node" || nodeType === "hub" || nodeType === "branch";
}
function isCandidateNodeType(nodeType, connectionMode, registry) {
  if (registry) return registry.isConnectionCandidate(nodeType, connectionMode);
  if (connectionMode === "group") {
    return nodeType === "group";
  }
  return isNodePrimitiveType(nodeType) || nodeType === "composition" || nodeType === "subgraph";
}
function getDefaultNodeSize(nodeType, isCollapsed = false, registry) {
  if (registry) return registry.getDefaultSize(nodeType, isCollapsed);
  switch (nodeType) {
    case "group":
    case "composition":
      return NODE_SIZE.group;
    case "subgraph":
      return isCollapsed ? NODE_SIZE.subgraphCollapsed : NODE_SIZE.subgraph;
    case "composition-child":
      return NODE_SIZE.compositionChild;
    case "hub":
      return NODE_SIZE.hub;
    case "branch":
      return NODE_SIZE.branch;
    case "node":
      return isCollapsed ? NODE_SIZE.nodeCollapsed : NODE_SIZE.node;
    default:
      return NODE_SIZE.node;
  }
}
function drawHandle(ctx, handle, x, y) {
  const { style, isConnected } = handle;
  const radius = style.size / 2;
  const borderColor = isConnected ? style.connectedBorderColor : style.disconnectedBorderColor;
  ctx.save();
  ctx.fillStyle = style.backgroundColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = style.borderWidth;
  if (style.shape === "circle") {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * PI);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.rect(x - radius, y - radius, style.size, style.size);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
const NODE_THEMES = {
  dark: {
    bgFill: "rgba(30, 41, 59, 0.8)",
    borderStroke: "rgba(255, 255, 255, 0.1)",
    headerFill: "rgba(14, 13, 13, 0.9)",
    titleFill: "#f8fafc",
    bodyFill: "rgba(19, 18, 18, 0.8)",
    borderWidth: 1
  },
  light: {
    bgFill: "rgba(248, 250, 252, 0.9)",
    borderStroke: "rgba(0, 0, 0, 0.1)",
    headerFill: "rgba(226, 232, 240, 1)",
    titleFill: "#0f172a",
    bodyFill: "rgba(205, 205, 205, 0.9)",
    borderWidth: 1
  },
  neon: {
    bgFill: "rgba(10, 10, 20, 0.9)",
    borderStroke: "rgb(10, 35, 39)",
    headerFill: "rgba(10, 35, 39, 0.76)",
    titleFill: "#cffafe",
    bodyFill: "rgb(16, 96, 128)",
    borderWidth: 2
  }
};
const G_NODE_THEMES = {
  dark: {
    bgFill: "rgb(9, 9, 10)",
    borderStroke: "rgba(255, 255, 255, 0.14)",
    headerFill: "rgba(22, 20, 20, 0.79)",
    titleFill: "#f8fafc",
    bodyFill: "rgb(27, 27, 27)",
    borderWidth: 1
  },
  light: {
    bgFill: "rgba(248, 250, 252, 0.9)",
    borderStroke: "rgba(0, 0, 0, 0.4)",
    headerFill: "rgba(226, 232, 240, 1)",
    titleFill: "#0f172a",
    bodyFill: "#475569",
    borderWidth: 1
  },
  neon: {
    bgFill: "rgba(10, 10, 20, 0.9)",
    borderStroke: "#06b6d4",
    headerFill: "rgba(6, 182, 212, 0.2)",
    titleFill: "#cffafe",
    bodyFill: "rgb(16, 96, 128)",
    borderWidth: 2
  }
};
const C_NODE_THEMES = {
  dark: {
    bgFill: "rgb(9, 9, 10)",
    borderStroke: "rgba(44, 159, 146, 0.9)",
    headerFill: "none",
    titleFill: "#f8fafc",
    bodyFill: "rgba(3, 3, 3)",
    borderWidth: 1
  },
  light: {
    bgFill: "rgba(248, 250, 252, 0.9)",
    borderStroke: "rgba(0, 0, 0, 0.4)",
    headerFill: "rgba(226, 232, 240, 1)",
    titleFill: "#0f172a",
    bodyFill: "rgba(44, 159, 146, 0.3)",
    borderWidth: 1
  },
  neon: {
    bgFill: "rgba(10, 10, 20, 0.9)",
    borderStroke: "#06b6d4",
    headerFill: "rgba(6, 182, 212, 0.2)",
    titleFill: "#cffafe",
    bodyFill: "rgba(44, 159, 146, 0.3)",
    borderWidth: 2
  }
};
const CR_NODE_THEMES = {
  dark: {
    bgFill: "rgba(0, 0, 0, 0)",
    borderStroke: "rgba(255, 255, 255, 0.95)",
    headerFill: "rgba(22, 20, 20, 0.79)",
    titleFill: "#f8fafc",
    bodyFill: "rgba(0, 0, 0, 0)",
    borderWidth: 1
  },
  light: {
    bgFill: "rgba(0, 0, 0, 0)",
    borderStroke: "rgba(0, 0, 0, 0.5)",
    headerFill: "rgba(226, 232, 240, 1)",
    titleFill: "#0f172a",
    bodyFill: "rgba(0, 0, 0, 0)",
    borderWidth: 1
  },
  neon: {
    bgFill: "rgba(0, 0, 0, 0)",
    borderStroke: "#06b6d4",
    headerFill: "rgba(6, 182, 212, 0.2)",
    titleFill: "#cffafe",
    bodyFill: "rgba(0, 0, 0, 0)",
    borderWidth: 2
  }
};
const SVG_NS = "http://www.w3.org/2000/svg";
const NODE_HEAD_TEXTURE_SKINS = [
  ` <svg width="595" height="93" viewBox="0 0 595 93" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_4024_15406)"> <rect width="595" height="93" rx="9" fill="#D946EF"/> </g> <defs> <filter id="filter0_i_4024_15406" x="0" y="0" width="595" height="97" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"> <feFlood flood-opacity="0" result="BackgroundImageFix"/> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/> <feGaussianBlur stdDeviation="24.5"/> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/> <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/> <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4024_15406"/> </filter>
</defs> </svg> `,
  `
<svg width="202" height="30" viewBox="0 0 202 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_in_2_2)">
<rect width="202" height="30" rx="8" fill="#F0F0F0"/>
</g>
<defs>
<filter id="filter0_in_2_2" x="0" y="0" width="202" height="34" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_2"/>
<feTurbulence type="fractalNoise" baseFrequency="0.25 0.25" stitchTiles="stitch" numOctaves="3" result="noise" seed="1670" />
<feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
<feComponentTransfer in="alphaNoise" result="coloredNoise1">
<feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "/>
</feComponentTransfer>
<feComposite operator="in" in2="effect1_innerShadow_2_2" in="coloredNoise1" result="noise1Clipped" />
<feFlood flood-color="rgba(0, 0, 0, 0.25)" result="color1Flood" />
<feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
<feMerge result="effect2_noise_2_2">
<feMergeNode in="effect1_innerShadow_2_2" />
<feMergeNode in="color1" />
</feMerge>
</filter>
</defs>
</svg>

`,
  `
<svg width="202" height="30" viewBox="0 0 202 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_2_3)">
<rect width="202" height="30" rx="8" fill="#F0F0F0" fill-opacity="0.2"/>
</g>
<defs>
<filter id="filter0_i_2_3" x="0" y="0" width="202" height="34" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_3"/>
</filter>
</defs>
</svg>


`
];
const COMPOSITION_HEAD_TEXTURE_SKINS = [];
const COMPOSITION_CHILD_HEAD_TEXTURE_SKINS = [];
const COMPOSITION_REFERENCE_CHILD_HEAD_TEXTURE_SKINS = [];
const NODE_BODY_TEXTURE_SKINS = [
  `
  <svg width="262" height="234" viewBox="0 0 262 234" fill="none" xmlns="http://www.w3.org/2000/svg"> <g filter="url(#filter0_d_4026_2521)">
<path d="M4.75 28.75C4.75 13.286 17.2861 0.75 32.7501 0.75H57.177C63.9909 0.75 70.5709 3.23467 75.6842 7.73843L107.5 35.7616C112.613 40.2653 119.193 42.75 126.007 42.75H228.75C244.214 42.75 256.75 55.286 256.75 70.75V196.75C256.75 212.214 244.214 224.75 228.75 224.75H32.7501C17.2861 224.75 4.75 212.214 4.75 196.75V42.75V28.75Z" fill="url(#paint0_radial_4026_2521)" shape-rendering="crispEdges"/> <path d="M126.007 42.75H228.75C244.214 42.75 256.75 55.286 256.75 70.75V196.75C256.75 212.214 244.214 224.75 228.75 224.75H32.7501C17.2861 224.75 4.75 212.214 4.75 196.75V42.75M126.007 42.75C119.193 42.75 112.613 40.2653 107.5 35.7616L75.6842 7.73843C70.5709 3.23467 63.9909 0.75 57.177 0.75H32.7501C17.2861 0.75 4.75 13.286 4.75 28.75V42.75M126.007 42.75H4.75" stroke="var(--stroke-theme)" stroke-opacity="0.16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"/> </g>
<defs> <filter id="filter0_d_4026_2521" x="0" y="0" width="261.5" height="233.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"> <feFlood flood-opacity="0" result="BackgroundImageFix"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/> <feGaussianBlur stdDeviation="2"/> <feComposite in2="hardAlpha" operator="out"/> <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.28 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4026_2521"/> <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4026_2521" result="shape"/> </filter> <radialGradient id="paint0_radial_4026_2521" cx="0" cy="0" r="1" gradientTransform="matrix(-232.683 -221.365 249.035 -261.996 130.75 112.75)" gradientUnits="userSpaceOnUse">
<stop stop-color="#D946EF"/> <stop offset="1" stop-color="#7C2889"/> </radialGradient>
</defs>
</svg>
`,
  `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_in_2_12)">
<rect width="206" height="142" rx="8" fill="var(--theme)"/>
</g>
<defs>
<filter id="filter0_in_2_12" x="0" y="0" width="206" height="146" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_12"/>
<feTurbulence type="fractalNoise" baseFrequency="0.25 0.25" stitchTiles="stitch" numOctaves="3" result="noise" seed="1670" />
<feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
<feComponentTransfer in="alphaNoise" result="coloredNoise1">
<feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "/>
</feComponentTransfer>
<feComposite operator="in" in2="effect1_innerShadow_2_12" in="coloredNoise1" result="noise1Clipped" />
<feFlood flood-color="rgba(0, 0, 0, 0.25)" result="color1Flood" />
<feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
<feMerge result="effect2_noise_2_12">
<feMergeNode in="effect1_innerShadow_2_12" />
<feMergeNode in="color1" />
</feMerge>
</filter>
</defs>
</svg>

`,
  `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_2_13)">
<rect width="206" height="142" rx="8" fill="var(--theme)" fill-opacity="0.2"/>
</g>
<defs>
<filter id="filter0_i_2_13" x="0" y="0" width="206" height="146" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_13"/>
</filter>
</defs>
</svg>
`,
  `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_2_14)">
<rect width="206" height="142" rx="8" fill="var(--theme)"/>
</g>
<defs>
<filter id="filter0_i_2_14" x="0" y="0" width="206" height="146" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_14"/>
</filter>
</defs>
</svg>

`
];
const GROUP_HEAD_TEXTURE_SKINS = [
  NODE_BODY_TEXTURE_SKINS[2],
  `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="206" height="142" rx="8" fill="var(--theme)" fill-opacity="0"/>
</svg>

`
];
const GROUP_BODY_TEXTURE_SKINS = [NODE_BODY_TEXTURE_SKINS[2]];
const COMPOSITION_BODY_TEXTURE_SKINS = [];
const COMPOSITION_REFERENCE_BODY_TEXTURE_SKINS = [];
const DEFAULT_TEXTURE_SKINS = {
  "node-head": NODE_HEAD_TEXTURE_SKINS,
  "node-body": NODE_BODY_TEXTURE_SKINS,
  "composition-head": COMPOSITION_HEAD_TEXTURE_SKINS,
  "composition-body": COMPOSITION_BODY_TEXTURE_SKINS,
  "composition-child-head": COMPOSITION_CHILD_HEAD_TEXTURE_SKINS,
  "composition-reference-child-head": COMPOSITION_REFERENCE_CHILD_HEAD_TEXTURE_SKINS,
  "group-head": GROUP_HEAD_TEXTURE_SKINS,
  "group-body": GROUP_BODY_TEXTURE_SKINS,
  "composition-reference-body": COMPOSITION_REFERENCE_BODY_TEXTURE_SKINS
};
const DEFAULT_TEXTURE_SOURCES = [
  createDefaultSource(
    "gg-node-body-default",
    "Default Node Body",
    "node-body",
    "var(--theme)",
    "var(--stroke-theme)"
  ),
  createDefaultSource(
    "gg-node-head-default",
    "Default Node Head",
    "node-head",
    "var(--theme)",
    "var(--stroke-theme)"
  ),
  createDefaultSource(
    "gg-group-body-default",
    "Default Group Body",
    "group-body",
    "var(--theme)",
    "var(--stroke-theme)"
  ),
  createDefaultSource(
    "gg-group-head-default",
    "Default Group Head",
    "group-head",
    "var(--theme)",
    "var(--stroke-theme)"
  ),
  createDefaultSource(
    "gg-composition-body-default",
    "Default Composition Body",
    "composition-body",
    "var(--theme)",
    "var(--stroke-theme)"
  ),
  createDefaultSource(
    "gg-composition-head-default",
    "Default Composition Head",
    "composition-head",
    "var(--theme)",
    "var(--stroke-theme)"
  ),
  createDefaultSource(
    "gg-composition-child-head-default",
    "Default Child Head",
    "composition-child-head",
    "var(--theme)",
    "var(--stroke-theme)"
  ),
  createDefaultSource(
    "gg-composition-reference-body",
    "Default Reference Body",
    "composition-reference-body",
    "var(--theme)",
    "var(--stroke-theme)"
  )
];
const TEXTURE_KIND_TO_LOOKUP = {
  "node-body": { lookupKey: "node", suffixKey: "body" },
  "node-head": { lookupKey: "node", suffixKey: "head" },
  "group-body": { lookupKey: "group", suffixKey: "body" },
  "group-head": { lookupKey: "group", suffixKey: "head" },
  "composition-body": { lookupKey: "composition", suffixKey: "body" },
  "composition-head": { lookupKey: "composition", suffixKey: "head" },
  "composition-child-head": { lookupKey: "composition-child", suffixKey: "head" },
  "composition-reference-body": { lookupKey: "composition-reference", suffixKey: "body" },
  "composition-reference-child-head": { lookupKey: "composition-reference", suffixKey: "head" }
};
const NODE_ID_TEXTURE_LOOKUP = {
  node: {
    body: "gg-node-body-default",
    head: "gg-node-head-default"
  },
  hub: {
    body: "gg-node-body-default",
    head: "gg-node-head-default"
  },
  branch: {
    body: "gg-node-body-default",
    head: "gg-node-head-default"
  },
  group: {
    body: "gg-group-body-default",
    head: "gg-group-head-default"
  },
  composition: {
    body: "gg-composition-body-default",
    head: "gg-composition-head-default"
  },
  "composition-child": {
    body: "gg-node-body-default",
    head: "gg-composition-child-head-default"
  },
  subgraph: {
    body: "",
    head: ""
  },
  "composition-reference": {
    body: "gg-composition-reference-body",
    head: "gg-composition-reference-child-head"
  }
};
const _textureRegistry = class _textureRegistry {
  constructor(defaultSources = DEFAULT_TEXTURE_SOURCES) {
    __publicField(this, "sources", /* @__PURE__ */ new Map());
    __publicField(this, "ownedPreviewUrls", /* @__PURE__ */ new Set());
    __publicField(this, "theme_", null);
    for (const source of defaultSources) {
      this.registerDefault(source);
    }
    document == null ? void 0 : document.addEventListener("gg-texture-select-change", (e) => {
      const customEvent = e;
      const kind = customEvent.detail.kind;
      const mapping = TEXTURE_KIND_TO_LOOKUP[kind];
      if (!mapping) return;
      NODE_ID_TEXTURE_LOOKUP[mapping.lookupKey] = {
        ...NODE_ID_TEXTURE_LOOKUP[mapping.lookupKey],
        [mapping.suffixKey]: customEvent.detail.value
      };
    });
  }
  static get instance() {
    if (!this._instance) {
      this._instance = new _textureRegistry();
    }
    return this._instance;
  }
  set theme(newTheme) {
    if (this.theme_ === newTheme) return;
    this.theme_ = newTheme;
    this.updatePreviewUrls();
  }
  updatePreviewUrls() {
    for (const source of this.sources.values()) {
      if (source.sourceType === "upload") {
        if (source.previewUrl && this.ownedPreviewUrls.has(source.previewUrl)) {
          URL.revokeObjectURL(source.previewUrl);
          this.ownedPreviewUrls.delete(source.previewUrl);
        }
        source.previewUrl = createSvgPreviewUrl(
          this.getResolvedSvgText(source)
        );
        this.ownedPreviewUrls.add(source.previewUrl);
      }
    }
    document == null ? void 0 : document.dispatchEvent(new CustomEvent("gg-texture-registry-update"));
  }
  getStrokeColorForKind(kind) {
    const theme = this.theme_ || "dark";
    switch (kind) {
      case "composition-reference-body":
        return CR_NODE_THEMES[theme].borderStroke;
      case "composition-body":
        return C_NODE_THEMES[theme].borderStroke;
      case "node-body":
        return NODE_THEMES[theme].borderStroke;
      case "composition-child-head":
      case "composition-head":
      case "group-head":
      case "node-head":
      case "composition-reference-child-head":
        return "none";
      default:
        return G_NODE_THEMES[theme].borderStroke;
    }
  }
  getThemeColorForKind(kind) {
    const theme = this.theme_ || "dark";
    switch (kind) {
      case "node-head":
      case "composition-reference-child-head":
      case "composition-child-head":
        return NODE_THEMES[theme].headerFill;
      case "node-body":
        return NODE_THEMES[theme].bodyFill;
      case "composition-reference-body":
        return CR_NODE_THEMES[theme].bodyFill;
      case "group-head":
        return G_NODE_THEMES[theme].headerFill;
      case "composition-head":
        return C_NODE_THEMES[theme].headerFill;
      case "group-body":
        return G_NODE_THEMES[theme].bodyFill;
      case "composition-body":
        return C_NODE_THEMES[theme].bodyFill;
      default:
        return G_NODE_THEMES[theme].bgFill;
    }
  }
  getResolvedSvgText(source) {
    return source.svgText.replaceAll(
      "var(--theme)",
      this.getThemeColorForKind(source.kind)
    ).replaceAll(
      "var(--stroke-theme)",
      this.getStrokeColorForKind(source.kind)
    );
  }
  all() {
    return [...this.sources.values()].map((source) => ({ ...source }));
  }
  byKind(kind) {
    return this.all().filter((source) => source.kind === kind);
  }
  get(id) {
    const source = this.sources.get(id);
    if (!source) return void 0;
    return { ...source, svgText: this.getResolvedSvgText(source) };
  }
  has(id) {
    return this.sources.has(id);
  }
  addUploaded(params) {
    const svgText = sanitizeSvg(params.svgText);
    const id = this.ensureUniqueId(params.id ?? slugify(params.label));
    const source = {
      id,
      label: params.label,
      kind: params.kind,
      sourceType: "upload",
      svgText,
      previewUrl: ""
    };
    source.previewUrl = createSvgPreviewUrl(this.getResolvedSvgText(source));
    if (source.previewUrl) {
      this.ownedPreviewUrls.add(source.previewUrl);
    }
    this.sources.set(source.id, source);
    return { ...source };
  }
  removeUploaded(id) {
    const source = this.sources.get(id);
    if (!source || source.sourceType !== "upload") return false;
    if (source.previewUrl && this.ownedPreviewUrls.has(source.previewUrl)) {
      URL.revokeObjectURL(source.previewUrl);
      this.ownedPreviewUrls.delete(source.previewUrl);
    }
    this.sources.delete(id);
    return true;
  }
  dispose() {
    for (const previewUrl of this.ownedPreviewUrls) {
      URL.revokeObjectURL(previewUrl);
    }
    this.ownedPreviewUrls.clear();
  }
  registerDefault(source) {
    this.sources.set(source.id, {
      ...source,
      sourceType: "default",
      previewUrl: source.previewUrl ?? svgToDataUrl(source.svgText)
    });
  }
  ensureUniqueId(baseId) {
    const cleanBase = baseId || "texture";
    if (!this.sources.has(cleanBase)) return cleanBase;
    let suffix = 2;
    while (this.sources.has(`${cleanBase}-${suffix}`)) {
      suffix += 1;
    }
    return `${cleanBase}-${suffix}`;
  }
};
__publicField(_textureRegistry, "_instance", null);
let textureRegistry = _textureRegistry;
function getDefaultTextureIds(nodeType, registry) {
  if (registry) {
    const desc = registry.get(nodeType);
    if (desc) return { ...desc.defaultTextureIds };
  }
  const defaults = NODE_ID_TEXTURE_LOOKUP[nodeType];
  return { ...defaults };
}
function getCompositionReferenceTextureIds() {
  const defaults = NODE_ID_TEXTURE_LOOKUP["composition-reference"];
  return { ...defaults };
}
function createDefaultSource(id, label, kind, fill, stroke) {
  const svgText = buildDefaultTextureSvg(fill, stroke);
  return {
    id,
    label,
    kind,
    sourceType: "default",
    svgText,
    previewUrl: svgToDataUrl(svgText)
  };
}
function generateTetureSkinOption(kind, label, index, id) {
  const skinReg = DEFAULT_TEXTURE_SKINS[kind];
  const svgText = index < skinReg.length ? skinReg[index] : skinReg[0];
  const source = {
    id,
    label,
    kind,
    sourceType: "upload",
    svgText,
    previewUrl: createSvgPreviewUrl(svgText)
  };
  if (source.previewUrl) {
    TextureRegistry.ownedPreviewUrls.add(source.previewUrl);
  }
  return { ...source };
}
function buildDefaultTextureSvg(fill, stroke) {
  return `
  <svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="${SVG_NS}">
    <rect x="0.5" y="0.5" width="205" height="141" rx="7.5" fill="${fill}"  stroke="${stroke}" stroke-width="2"/>
  </svg>
`;
}
function sanitizeSvg(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;
  if (svg.nodeName.toLowerCase() === "parsererror" || svg.nodeName.toLowerCase() !== "svg") {
    throw new Error("Uploaded texture must be a valid SVG document");
  }
  const forbiddenElements = /* @__PURE__ */ new Set([
    "script",
    "foreignobject",
    "iframe",
    "object",
    "embed",
    "audio",
    "video",
    "canvas"
  ]);
  for (const element of [...svg.querySelectorAll("*")]) {
    const tagName = element.tagName.toLowerCase();
    if (forbiddenElements.has(tagName)) {
      element.remove();
      continue;
    }
    for (const attr of [...element.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || value.startsWith("javascript:") || value.includes("url(http:") || value.includes("url(https:") || value.includes("url(//")) {
        element.removeAttribute(attr.name);
      }
    }
  }
  return new XMLSerializer().serializeToString(svg);
}
function createSvgPreviewUrl(svgText) {
  return URL.createObjectURL(
    new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
  );
}
function svgToDataUrl(svgText) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}
function slugify(label) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const TextureRegistry = textureRegistry.instance;
const STYLES = (
  /* css */
  `
  *, *::before, *::after { box-sizing: border-box; }

  :host {
    display: inline-block;
    width: 100%;
    min-width: 220px;
    position: relative;
    font-family: inherit;
    --ts-radius: 8px;
    --ts-border: rgba(77, 77, 77, 0.25);
    --ts-border-focus: rgba(75, 75, 75, 0.15);
    --ts-focus-ring: rgba(92, 92, 95, 0.22);
    --ts-text: rgb(235, 235, 235);
    --ts-muted: #9ca3af;
    --ts-surface: var(--material-surface);
    --ts-hover-bg: rgba(36, 37, 39, 0.36);
    --ts-selected-bg: #ecfeff;
    --ts-selected-text: #0f766e;
    --ts-accent: #0d9488;
    --ts-shadow: 0 8px 24px -4px rgba(0,0,0,.12), 0 3px 8px -2px rgba(0,0,0,.07);
  }

  :host([disabled]) { opacity: .45; pointer-events: none; }

  .trigger {
    width: 100%;
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 16px;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    background: var(--ts-surface);
    border: 1.5px solid var(--ts-border);
    border-radius: var(--ts-radius);
    color: var(--ts-text);
    cursor: pointer;
    user-select: none;
    transition: border-color .15s, box-shadow .15s;
  }

  .trigger:hover { border-color: #9ca3af; }

  .trigger:focus-visible,
  .trigger[aria-expanded="true"] {
    outline: none;
    border-color: var(--ts-border-focus);
    box-shadow: 0 0 0 3px var(--ts-focus-ring);
  }

  .preview {
    width: 36px;
    height: 28px;
    border-radius: 6px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .preview.is-empty {
    display: grid;
    place-items: center;
    color: var(--ts-muted);
    font-size: 12px;
  }

  .trigger-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
  }

  .trigger-label.is-placeholder {
    color: var(--ts-muted);
    font-weight: 400;
  }

  .chevron {
    width: 16px;
    height: 16px;
    color: #6b7280;
    transition: transform .2s ease;
  }

  .trigger[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  .dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-height: 300px;
    overflow-y: auto;
    padding: 5px;
    margin: 0;
    list-style: none;
    background: var(--ts-surface);
    border: 2px solid transparent;
    outline: 1.5px solid rgba(109, 109, 109, 0.76);
    border-radius: var(--ts-radius);
    box-shadow: var(--ts-shadow);
    backdrop-filter: blur(8px);
    transform-origin: top center;
    animation: pop-in .13s ease both;
  }

  .dropdown[hidden] { display: none; }

  @keyframes pop-in {
    from { opacity: 0; transform: scaleY(.94) translateY(-4px); }
    to { opacity: 1; transform: scaleY(1) translateY(0); }
  }

  .option {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 14px;
    align-items: center;
    gap: 10px;
    padding: 6px 9px;
    border-radius: 5px;
    color: var(--ts-text);
    cursor: pointer;
    transition: background .1s linear;
  }

  .option:hover,
  .option[data-active] { background: var(--ts-accent); }

  .option[aria-selected="true"] {
    background: var(--ts-selected-bg);
    color: var(--ts-selected-text);
    font-weight: 600;
  }

  .option-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.82rem;
  }

  .option-meta {
    color: var(--ts-muted);
    font-size: 0.68rem;
    text-transform: capitalize;
  }

  .option[aria-selected="true"] .option-meta {
    color: rgba(15, 118, 110, 0.72);
  }

  .check {
    width: 14px;
    height: 14px;
    color: currentColor;
    visibility: hidden;
  }

  .option[aria-selected="true"] .check { visibility: visible; }

  .empty {
    padding: 10px;
    color: var(--ts-muted);
    font-size: 0.8rem;
  }

  .dropdown::-webkit-scrollbar { width: 5px; }
  .dropdown::-webkit-scrollbar-track { background: transparent; }
  .dropdown::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
`
);
const CHEVRON_SVG = (
  /* html */
  `
  <svg class="chevron" viewBox="0 0 16 16" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.75"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
);
const CHECK_SVG = (
  /* html */
  `
  <svg class="check" viewBox="0 0 14 14" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="currentColor" stroke-width="1.75"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
);
class TextureSelect extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "triggerEl");
    __publicField(this, "triggerPreviewEl");
    __publicField(this, "triggerLabelEl");
    __publicField(this, "dropdownEl");
    __publicField(this, "isOpen", false);
    __publicField(this, "activeIdx", -1);
    __publicField(this, "onDocClick");
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
    this.cacheRefs();
    this.bindEvents();
    this.syncOptions();
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.onDocClick, true);
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal || !this.triggerEl) return;
    switch (name) {
      case "kind":
        this.syncOptions();
        break;
      case "placeholder":
        this.updateTrigger();
        break;
      case "value":
        this.refreshOptionStates();
        this.updateTrigger();
        break;
      case "disabled":
        this.triggerEl.disabled = this.disabled;
        break;
    }
  }
  get value() {
    return this.getAttribute("value") ?? "";
  }
  set value(value) {
    this.setAttribute("value", value);
  }
  get name() {
    return this.getAttribute("name") ?? "";
  }
  get kind() {
    return this.getAttribute("kind") ?? "";
  }
  get placeholder() {
    return this.getAttribute("placeholder") ?? "Select texture";
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  refresh() {
    this.syncOptions();
  }
  render() {
    this.shadowRoot.innerHTML = /* html */
    `
      <style>${STYLES}</style>
      <button
        class="trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="false"
        ${this.disabled ? "disabled" : ""}
      >
        <span class="preview is-empty" aria-hidden="true">-</span>
        <span class="trigger-label is-placeholder">${this.escHtml(this.placeholder)}</span>
        ${CHEVRON_SVG}
      </button>
      <ul class="dropdown" role="listbox" hidden></ul>
    `;
  }
  cacheRefs() {
    this.triggerEl = this.shadowRoot.querySelector(".trigger");
    this.triggerPreviewEl = this.shadowRoot.querySelector(".preview");
    this.triggerLabelEl = this.shadowRoot.querySelector(".trigger-label");
    this.dropdownEl = this.shadowRoot.querySelector(".dropdown");
  }
  bindEvents() {
    this.triggerEl.addEventListener("click", () => this.toggleDropdown());
    this.triggerEl.addEventListener("keydown", (e) => this.onTriggerKeydown(e));
    this.dropdownEl.addEventListener("pointermove", (e) => {
      const option = e.target.closest(".option");
      if (option) this.setActive(Number(option.dataset["idx"]));
    });
    this.dropdownEl.addEventListener("click", (e) => {
      const option = e.target.closest(".option");
      if (!option) return;
      this.selectByIdx(Number(option.dataset["idx"]));
      this.closeDropdown();
      this.triggerEl.focus();
    });
    this.dropdownEl.addEventListener("keydown", (e) => this.onDropdownKeydown(e));
    this.onDocClick = (e) => {
      if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) {
        this.closeDropdown();
      }
    };
    document.addEventListener("click", this.onDocClick, true);
  }
  syncOptions() {
    const options = this.getOptions();
    if (options.length === 0) {
      this.dropdownEl.innerHTML = `<li class="empty">No textures available</li>`;
      this.updateTrigger();
      return;
    }
    this.dropdownEl.innerHTML = options.map(
      (option, index) => (
        /* html */
        `
        <li
          class="option"
          role="option"
          data-idx="${index}"
          data-value="${this.escAttr(option.id)}"
          aria-selected="${option.id === this.value ? "true" : "false"}"
        >
          <img class="preview" src="${this.escAttr(option.previewUrl ?? "")}" alt="" />
          <span class="option-main">
            <span class="option-label">${this.escHtml(option.label)}</span>
            <span class="option-meta">${this.escHtml(option.sourceType)}</span>
          </span>
          ${CHECK_SVG}
        </li>`
      )
    ).join("");
    this.updateTrigger();
  }
  selectByIdx(idx) {
    const options = this.getOptions();
    const selected = options[idx];
    if (!selected) return;
    this.setAttribute("value", selected.id);
    this.refreshOptionStates();
    this.updateTrigger();
    this.dispatchEvent(
      new CustomEvent("gg-texture-select-change", {
        bubbles: true,
        composed: true,
        detail: {
          value: selected.id,
          label: selected.label,
          name: this.name,
          kind: selected.kind,
          sourceType: selected.sourceType,
          previewUrl: selected.previewUrl ?? ""
        }
      })
    );
  }
  updateTrigger() {
    const selected = this.getOptions().find((option) => option.id === this.value);
    if (!selected) {
      this.triggerPreviewEl.outerHTML = `<span class="preview is-empty" aria-hidden="true">-</span>`;
      this.triggerPreviewEl = this.shadowRoot.querySelector(".preview");
      this.triggerLabelEl.textContent = this.placeholder;
      this.triggerLabelEl.classList.add("is-placeholder");
      return;
    }
    this.triggerPreviewEl.outerHTML = `<img class="preview" src="${this.escAttr(selected.previewUrl ?? "")}" alt="" />`;
    this.triggerPreviewEl = this.shadowRoot.querySelector(".preview");
    this.triggerLabelEl.textContent = selected.label;
    this.triggerLabelEl.classList.remove("is-placeholder");
  }
  refreshOptionStates() {
    const value = this.value;
    this.dropdownEl.querySelectorAll(".option").forEach((option) => {
      option.setAttribute(
        "aria-selected",
        option.dataset["value"] === value ? "true" : "false"
      );
    });
  }
  toggleDropdown() {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }
  openDropdown() {
    this.isOpen = true;
    this.triggerEl.setAttribute("aria-expanded", "true");
    this.dropdownEl.removeAttribute("hidden");
    const items = this.dropdownItems();
    let startIdx = 0;
    items.forEach((item, index) => {
      if (item.getAttribute("aria-selected") === "true") startIdx = index;
    });
    this.setActive(startIdx);
  }
  closeDropdown() {
    this.isOpen = false;
    this.triggerEl.setAttribute("aria-expanded", "false");
    this.dropdownEl.setAttribute("hidden", "");
    this.clearActive();
  }
  onTriggerKeydown(e) {
    const handled = ["ArrowDown", "ArrowUp", "Enter", " "];
    if (!handled.includes(e.key)) return;
    e.preventDefault();
    if (!this.isOpen) {
      this.openDropdown();
      return;
    }
    if (e.key === "ArrowDown") this.moveActive(1);
    else if (e.key === "ArrowUp") this.moveActive(-1);
    else if (e.key === "Enter" || e.key === " ") {
      if (this.activeIdx >= 0) {
        this.selectByIdx(this.activeIdx);
        this.closeDropdown();
      }
    }
  }
  onDropdownKeydown(e) {
    if (e.key === "Escape") {
      this.closeDropdown();
      this.triggerEl.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.moveActive(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (this.activeIdx >= 0) {
        this.selectByIdx(this.activeIdx);
        this.closeDropdown();
        this.triggerEl.focus();
      }
    } else if (e.key === "Tab") {
      this.closeDropdown();
    }
  }
  setActive(idx) {
    const items = this.dropdownItems();
    this.clearActive();
    if (idx < 0 || idx >= items.length) return;
    this.activeIdx = idx;
    items[idx].setAttribute("data-active", "");
    items[idx].scrollIntoView({ block: "nearest" });
  }
  clearActive() {
    this.dropdownItems().forEach((item) => item.removeAttribute("data-active"));
    this.activeIdx = -1;
  }
  moveActive(direction) {
    const items = this.dropdownItems();
    if (items.length === 0) return;
    const next = ((this.activeIdx + direction) % items.length + items.length) % items.length;
    this.setActive(next);
  }
  dropdownItems() {
    return [...this.dropdownEl.querySelectorAll(".option")];
  }
  getOptions() {
    if (!this.kind) return TextureRegistry.all();
    return TextureRegistry.byKind(this.kind);
  }
  escAttr(value) {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }
  escHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}
__publicField(TextureSelect, "observedAttributes", [
  "placeholder",
  "value",
  "disabled",
  "name",
  "kind"
]);
if (!customElements.get("gg-texture-select")) {
  customElements.define("gg-texture-select", TextureSelect);
}
const STYLE_TEMPLATE = `
      :host {
        position: absolute;
        top: 2.5vh;
        right: 0;
        height: 95vh;
        width: 300px;
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-left: 1px solid var(--glass-border);
        border: inset 2px solid transparent;
        box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 50;
        border-radius: var(--radius-md) 0 0 var(--radius-md);
      }

      :host>.root {
        top: 0;
        right: inherit;
        position: inherit;
        height: inherit;
        width: inherit;
        display: flex;
        flex-direction: inherit;
        padding-bottom: 2rem;
      }

      .sidebar-toggle {
        position: absolute;
        left: -24px;
        top: 20px;
        width: 24px;
        height: 48px;
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        border-right: none;
        border-radius: 8px 0 0 8px;
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      .sidebar-toggle svg {
        transform: scale(-0.8, 0.8);
      }

      .sidebar-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--accent);
      }

      :host(.collapsed) {
        transform: translateX(100%);
      }

      :host(.collapsed) .sidebar-toggle svg {
        transform: scale(0.8, 0.8);
      }

      .sidebar-content {
        flex: 1;
        max-height: 100%;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        font-size: 0.8rem;
        padding-bottom: 2rem;
        scrollbar-width: thin;
      }

      .sidebar-content::-webkit-scrollbar {
        // display: none;
      }

      .settings-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .settings-group.vertical {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        width: 100%;
      }

      .sidebar-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .section-header {
        font-size: 0.6rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: rgb(95, 95, 95);
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: 6px;
        margin-bottom: 4px;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      .controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      button:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      button:active {
        transform: scale(0.98);
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      input[type="color" i] {
        display: block;
        border: none;
        outline: none;
        width: 2rem;
        border-radius: 50%;
        color: transparent;
        background-color: unset;
        height: 2rem;
        border-radius: 2rem;
      }

      input[type="color" i]::-webkit-color-swatch {
        border-radius: 50%;
        border: 1px solid var(--glass-border);
      }

      input[type="text"] {
        width: 90%;
        padding: 0.5rem 0.5rem;
        background-color: var(--material-surface);
        border: none;
        outline: none;
        color: white;
        border-radius: 0.3rem;
      }

`;
let UIControls$1 = (_a = class extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _shadow5, this.attachShadow({ mode: "open" }));
  }
  connectedCallback() {
    this.render();
  }
  render() {
    __privateGet(this, _shadow5).innerHTML = `
    <style>
      ${STYLE_TEMPLATE}
    </style>

    ${this.getChildrenTemplate()}
  `;
  }
  getChildrenTemplate() {
    return `
    <div class="root" part="root">
    <button
        id="sidebar-toggle"
        class="sidebar-toggle"
        aria-label="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 19L8 12L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      </button>
      <div class="sidebar-content">
        <div class="sidebar-section">
          <div class="section-header">Canvas</div>
          <div class="settings-group">
            <label for="bg-color-picker">Color</label>
            <input type="color" id="bg-color-picker" value="#0f172a" />
          </div>
          <div class="settings-group">
            <label for="font-color-picker">Font Color</label>
            <input type="color" id="font-color-picker" value="#ffffff" />
          </div>

          <div class="settings-group vertical">
            <label for="theme-selector">Node Theme</label>
            <gg-select id="theme-selector">
              <gg-option value="dark">Dark (Glass)</gg-option>
              <gg-option value="light">Light</gg-option>
              <gg-option value="neon">Neon</gg-option>
            </gg-select>
          </div>

          <div class="settings-group vertical">
            <label for="texture-selector">Texture Theme</label>
            <gg-texture-select id="texture-selector">
            </gg-texture-select>
          </div>

        </div>

        <div id="node-properties" class="sidebar-section" style="display: none">
          <div class="section-header">Properties</div>
          <div class="settings-group vertical">
            <label for="node-label-input">Label</label>
            <input
              type="text"
              id="node-label-input"
              placeholder="Node label..."
              class="text-input"
            />
          </div>
          <gg-prop-group id="node-prop-group"></gg-prop-group>
        </div>
      </div>

    </div>

    `;
  }
}, _shadow5 = new WeakMap(), _a);
if (!customElements.get("gg-ui-controls"))
  customElements.define("gg-ui-controls", UIControls$1);
class GeometryNode {
  constructor(gl, meshType) {
    __publicField(this, "vertexBuffer", null);
    __publicField(this, "indexBuffer", null);
    this.gl = gl;
    switch (meshType) {
      case "rounded-square":
        this.generateSquareMesh();
        break;
    }
  }
  generateSquareMesh() {
    const gl = this.gl;
    const vertices = new Float32Array([
      // X,   Y,   U,   V
      0,
      0,
      0,
      0,
      // Top-Left
      0,
      1,
      0,
      1,
      // Bottom-Left
      1,
      1,
      1,
      1,
      // Bottom-Right
      1,
      0,
      1,
      0
      // Top-Right
    ]);
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    this.vertexBuffer = vertexBuffer;
    this.indexBuffer = indexBuffer;
  }
}
class BGGeometryNode {
  constructor(gl, meshType, canvas) {
    __publicField(this, "vertexBuffer", null);
    __publicField(this, "length", 0);
    __publicField(this, "primitiveType", -1);
    this.gl = gl;
    this.canvas = canvas;
    switch (meshType) {
      case "dotted":
        this.generateDotMesh();
        break;
      case "grid":
        this.generateGridMesh();
        break;
    }
  }
  generateDotMesh() {
    const gl = this.gl;
    const Vsegments = Math.max(900, this.canvas.height) / 10;
    const Hsegments = Math.max(900, this.canvas.width) / 10;
    const vertices = new Float32Array((Vsegments + 1) * (Hsegments + 1) * 2);
    const stepX = 10 / this.canvas.width * 2;
    const stepY = 10 / this.canvas.height * 2;
    for (let i = 0; i <= Vsegments; i++) {
      for (let j = 0; j <= Hsegments; j++) {
        let y = i, x = j;
        x = -1 + j * stepX;
        y = -1 + i * stepY + 0.1;
        const index = (i * (Hsegments + 1) + j) * 2;
        vertices[index] = x;
        vertices[index + 1] = y;
      }
    }
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    this.vertexBuffer = vertexBuffer;
    this.primitiveType = gl.POINTS;
    this.length = vertices.length / 2;
  }
  generateGridMesh() {
    const gl = this.gl;
    const lines = [];
    const HARD_DIM = this.canvas.height * 2.5;
    const divisionsX = HARD_DIM / 20;
    const divisionsY = HARD_DIM / 10;
    const stepX = 2 / divisionsX;
    const stepY = 2 / divisionsY;
    for (let i = 0; i <= Math.max(divisionsX, divisionsY); i++) {
      const posX = -1 + i * stepX;
      const posY = -1 + i * stepY;
      lines.push(posY, -1, posY, 1);
      lines.push(-1, posX, 1, posX);
    }
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
    this.vertexBuffer = vertexBuffer;
    this.length = lines.length / 2;
    this.primitiveType = gl.LINES;
  }
}
function createProgram(gl, vsSource, fsSource) {
  const vertexShader2 = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);
  vsSource = vsSource.trim();
  fsSource = fsSource.trim();
  if (!vertexShader2 || !fragmentShader2)
    throw new Error("could not create shader object");
  gl.shaderSource(vertexShader2, vsSource);
  gl.compileShader(vertexShader2);
  if (!gl.getShaderParameter(vertexShader2, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(vertexShader2);
    gl.deleteShader(vertexShader2);
    throw new Error(`failed to compile vertex shader: ${log}`);
  }
  gl.shaderSource(fragmentShader2, fsSource);
  gl.compileShader(fragmentShader2);
  if (!gl.getShaderParameter(fragmentShader2, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(fragmentShader2);
    gl.deleteShader(fragmentShader2);
    throw new Error(`failed to compile fragment shader: ${log}`);
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader2);
    gl.deleteShader(fragmentShader2);
    throw new Error("failed to create WebGL program");
  }
  gl.attachShader(program, vertexShader2);
  gl.attachShader(program, fragmentShader2);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = `failed to link program: ${gl.getProgramInfoLog(program)}`;
    gl.deleteShader(vertexShader2);
    gl.deleteShader(fragmentShader2);
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}
function getShaderLocations(gl, program) {
  const locations = {
    a_Position: gl.getAttribLocation(program, "a_Position"),
    a_TexCoord: gl.getAttribLocation(program, "a_TexCoord"),
    a_Z: gl.getAttribLocation(program, "a_Z"),
    u_Color: gl.getUniformLocation(program, "u_Color"),
    u_ModelMatrix: gl.getUniformLocation(program, "u_ModelMatrix"),
    u_ViewMatrix: gl.getUniformLocation(program, "u_ViewMatrix"),
    u_ProjMatrix: gl.getUniformLocation(program, "u_ProjMatrix"),
    u_Sampler: gl.getUniformLocation(program, "u_Sampler"),
    u_UseTexture: gl.getUniformLocation(program, "u_UseTexture"),
    u_Use9Slice: gl.getUniformLocation(program, "u_Use9Slice"),
    u_Dimensions: gl.getUniformLocation(program, "u_Dimensions"),
    u_TextureSize: gl.getUniformLocation(program, "u_TextureSize"),
    u_SliceMargins: gl.getUniformLocation(program, "u_SliceMargins"),
    u_RenderMode: gl.getUniformLocation(program, "u_RenderMode"),
    u_BorderColor: gl.getUniformLocation(program, "u_BorderColor"),
    u_BorderWidth: gl.getUniformLocation(program, "u_BorderWidth"),
    u_Radius: gl.getUniformLocation(program, "u_Radius")
  };
  validateShaderLocations(locations);
  return locations;
}
function getBGShaderLocations(gl, program) {
  const locations = {
    a_Position: gl.getAttribLocation(program, "a_Position"),
    u_Color: gl.getUniformLocation(program, "u_Color"),
    u_UsePointMask: gl.getUniformLocation(program, "u_UsePointMask")
  };
  validateShaderLocations(locations);
  return locations;
}
function getMSDFShaderLocations(gl, program) {
  const locations = {
    a_Position: gl.getAttribLocation(program, "a_Position"),
    a_TexCoord: gl.getAttribLocation(program, "a_TexCoord"),
    a_Color: gl.getAttribLocation(program, "a_Color"),
    a_Z: gl.getAttribLocation(program, "a_Z"),
    u_ViewMatrix: gl.getUniformLocation(program, "u_ViewMatrix"),
    u_ProjMatrix: gl.getUniformLocation(program, "u_ProjMatrix"),
    u_Atlas: gl.getUniformLocation(program, "u_Atlas"),
    u_pxRange: gl.getUniformLocation(program, "u_pxRange")
  };
  validateShaderLocations(locations);
  return locations;
}
function getIconBGLocations(gl, program) {
  const locations = {
    a_Position: gl.getAttribLocation(program, "a_Position"),
    a_Color: gl.getAttribLocation(program, "a_Color"),
    a_Shape: gl.getAttribLocation(program, "a_Shape"),
    a_BBoxMin: gl.getAttribLocation(program, "a_BBoxMin"),
    a_BBoxMax: gl.getAttribLocation(program, "a_BBoxMax"),
    a_Z: gl.getAttribLocation(program, "a_Z"),
    u_ViewMatrix: gl.getUniformLocation(program, "u_ViewMatrix"),
    u_ProjMatrix: gl.getUniformLocation(program, "u_ProjMatrix")
  };
  validateShaderLocations(locations);
  return locations;
}
function validateShaderLocations(locs) {
  for (const [key, val] of Object.entries(
    locs
  )) {
    if (key.startsWith("a_") && val < 0) {
      throw new Error(`Shader attribute ${key} has an invalid location`);
    } else if (key.startsWith("u_") && !val) {
      throw new Error(`Shader uniform ${key} has an invalid location`);
    }
  }
}
class CustomFBO {
  constructor(gl, width, height) {
    __publicField(this, "fbo");
    __publicField(this, "width");
    __publicField(this, "height");
    __publicField(this, "name", "CustomFBO");
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.allocate(width, height);
  }
  allocate(width, height) {
    throw new Error(`[${this.name}]: you must implement allocate function`);
  }
  bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    this.gl.viewport(0, 0, this.width, this.height);
  }
  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
  resize(width, height) {
    throw new Error(`[${this.name}]: you must implement resize function`);
  }
  destroy() {
    throw new Error(`[${this.name}]: you must implement destroy function`);
  }
}
class PickFBO extends CustomFBO {
  constructor(gl, width, height) {
    super(gl, width, height);
    __publicField(this, "texture");
    __publicField(this, "renderBuffer");
    this.gl = gl;
    this.allocate(width, height);
  }
  allocate(width, height) {
    const gl = this.gl;
    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    this.renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    this.gl.viewport(0, 0, this.width, this.height);
  }
  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
  /**
   * Read one pixel from the pick texture at canvas coordinates (x, y).
   * Note: WebGL's origin is bottom-left, so y is flipped.
   * Must be called while the FBO is bound.
   */
  readPixel(x, y) {
    const pixels = new Uint8Array(4);
    this.gl.readPixels(x, this.height - y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
    return pixels;
  }
  resize(width, height) {
    this.destroy();
    this.width = width;
    this.height = height;
    this.allocate(width, height);
  }
  destroy() {
    this.gl.deleteFramebuffer(this.fbo);
    this.gl.deleteTexture(this.texture);
    this.gl.deleteRenderbuffer(this.renderBuffer);
  }
}
class Matrix4 {
  constructor(opt_src) {
    __publicField(this, "elements");
    if (opt_src && typeof opt_src === "object" && opt_src.hasOwnProperty("elements")) {
      const s = opt_src.elements;
      const d = new Float32Array(16);
      for (let i = 0; i < 16; ++i) {
        d[i] = s[i];
      }
      this.elements = d;
    } else {
      this.elements = new Float32Array([
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ]);
    }
  }
  /** Set the identity matrix. */
  setIdentity() {
    const e = this.elements;
    e[0] = 1;
    e[4] = 0;
    e[8] = 0;
    e[12] = 0;
    e[1] = 0;
    e[5] = 1;
    e[9] = 0;
    e[13] = 0;
    e[2] = 0;
    e[6] = 0;
    e[10] = 1;
    e[14] = 0;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
    return this;
  }
  /** Copy matrix. */
  set(src) {
    const s = src.elements;
    const d = this.elements;
    if (s === d) return this;
    for (let i = 0; i < 16; ++i) {
      d[i] = s[i];
    }
    return this;
  }
  /** Multiply the matrix from the right. */
  concat(other) {
    const e = this.elements;
    const a = this.elements;
    let b = other.elements;
    if (e === b) {
      b = new Float32Array(16);
      for (let i = 0; i < 16; ++i) {
        b[i] = e[i];
      }
    }
    for (let i = 0; i < 4; i++) {
      const ai0 = a[i];
      const ai1 = a[i + 4];
      const ai2 = a[i + 8];
      const ai3 = a[i + 12];
      e[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
      e[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
      e[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
      e[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return this;
  }
  /** Alias for concat. */
  multiply(other) {
    return this.concat(other);
  }
  /** Multiply the three-dimensional vector. */
  multiplyVector3(pos) {
    const e = this.elements;
    const p = pos.elements;
    const v = new Vector3();
    const result = v.elements;
    result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[8] + e[11];
    result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[9] + e[12];
    result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + e[13];
    return v;
  }
  /** Multiply the four-dimensional vector. */
  multiplyVector4(pos) {
    const e = this.elements;
    const p = pos.elements;
    const v = new Vector4();
    const result = v.elements;
    result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[8] + p[3] * e[12];
    result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[9] + p[3] * e[13];
    result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + p[3] * e[14];
    result[3] = p[0] * e[3] + p[1] * e[7] + p[2] * e[11] + p[3] * e[15];
    return v;
  }
  /** Transpose the matrix. */
  transpose() {
    const e = this.elements;
    let t;
    t = e[1];
    e[1] = e[4];
    e[4] = t;
    t = e[2];
    e[2] = e[8];
    e[8] = t;
    t = e[3];
    e[3] = e[12];
    e[12] = t;
    t = e[6];
    e[6] = e[9];
    e[9] = t;
    t = e[7];
    e[7] = e[13];
    e[13] = t;
    t = e[11];
    e[11] = e[14];
    e[14] = t;
    return this;
  }
  /** Calculate the inverse matrix of specified matrix, and set to this. */
  setInverseOf(other) {
    const s = other.elements;
    const d = this.elements;
    const inv = new Float32Array(16);
    inv[0] = s[5] * s[10] * s[15] - s[5] * s[11] * s[14] - s[9] * s[6] * s[15] + s[9] * s[7] * s[14] + s[13] * s[6] * s[11] - s[13] * s[7] * s[10];
    inv[4] = -s[4] * s[10] * s[15] + s[4] * s[11] * s[14] + s[8] * s[6] * s[15] - s[8] * s[7] * s[14] - s[12] * s[6] * s[11] + s[12] * s[7] * s[10];
    inv[8] = s[4] * s[9] * s[15] - s[4] * s[11] * s[13] - s[8] * s[5] * s[15] + s[8] * s[7] * s[13] + s[12] * s[5] * s[11] - s[12] * s[7] * s[9];
    inv[12] = -s[4] * s[9] * s[14] + s[4] * s[10] * s[13] + s[8] * s[5] * s[14] - s[8] * s[6] * s[13] - s[12] * s[5] * s[10] + s[12] * s[6] * s[9];
    inv[1] = -s[1] * s[10] * s[15] + s[1] * s[11] * s[14] + s[9] * s[2] * s[15] - s[9] * s[3] * s[14] - s[13] * s[2] * s[11] + s[13] * s[3] * s[10];
    inv[5] = s[0] * s[10] * s[15] - s[0] * s[11] * s[14] - s[8] * s[2] * s[15] + s[8] * s[3] * s[14] + s[12] * s[2] * s[11] - s[12] * s[3] * s[10];
    inv[9] = -s[0] * s[9] * s[15] + s[0] * s[11] * s[13] + s[8] * s[1] * s[15] - s[8] * s[3] * s[13] - s[12] * s[1] * s[11] + s[12] * s[3] * s[9];
    inv[13] = s[0] * s[9] * s[14] - s[0] * s[10] * s[13] - s[8] * s[1] * s[14] + s[8] * s[2] * s[13] + s[12] * s[1] * s[10] - s[12] * s[2] * s[9];
    inv[2] = s[1] * s[6] * s[15] - s[1] * s[7] * s[14] - s[5] * s[2] * s[15] + s[5] * s[3] * s[14] + s[13] * s[2] * s[7] - s[13] * s[3] * s[6];
    inv[6] = -s[0] * s[6] * s[15] + s[0] * s[7] * s[14] + s[4] * s[2] * s[15] - s[4] * s[3] * s[14] - s[12] * s[2] * s[7] + s[12] * s[3] * s[6];
    inv[10] = s[0] * s[5] * s[15] - s[0] * s[7] * s[13] - s[4] * s[1] * s[15] + s[4] * s[3] * s[13] + s[12] * s[1] * s[7] - s[12] * s[3] * s[5];
    inv[14] = -s[0] * s[5] * s[14] + s[0] * s[6] * s[13] + s[4] * s[1] * s[14] - s[4] * s[2] * s[13] - s[12] * s[1] * s[6] + s[12] * s[2] * s[5];
    inv[3] = -s[1] * s[6] * s[11] + s[1] * s[7] * s[10] + s[5] * s[2] * s[11] - s[5] * s[3] * s[10] - s[9] * s[2] * s[7] + s[9] * s[3] * s[6];
    inv[7] = s[0] * s[6] * s[11] - s[0] * s[7] * s[10] - s[4] * s[2] * s[11] + s[4] * s[3] * s[10] + s[8] * s[2] * s[7] - s[8] * s[3] * s[6];
    inv[11] = -s[0] * s[5] * s[11] + s[0] * s[7] * s[9] + s[4] * s[1] * s[11] - s[4] * s[3] * s[9] - s[8] * s[1] * s[7] + s[8] * s[3] * s[5];
    inv[15] = s[0] * s[5] * s[10] - s[0] * s[6] * s[9] - s[4] * s[1] * s[10] + s[4] * s[2] * s[9] + s[8] * s[1] * s[6] - s[8] * s[2] * s[5];
    let det = s[0] * inv[0] + s[1] * inv[4] + s[2] * inv[8] + s[3] * inv[12];
    if (det === 0) return this;
    det = 1 / det;
    for (let i = 0; i < 16; i++) {
      d[i] = inv[i] * det;
    }
    return this;
  }
  /** Calculate the inverse matrix of this, and set to this. */
  invert() {
    return this.setInverseOf(this);
  }
  /** Set the orthographic projection matrix. */
  setOrtho(left, right, bottom, top, near, far) {
    if (left === right || bottom === top || near === far) {
      throw new Error("null frustum");
    }
    const rw = 1 / (right - left);
    const rh = 1 / (top - bottom);
    const rd = 1 / (far - near);
    const e = this.elements;
    e[0] = 2 * rw;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = 2 * rh;
    e[6] = 0;
    e[7] = 0;
    e[8] = 0;
    e[9] = 0;
    e[10] = -2 * rd;
    e[11] = 0;
    e[12] = -(right + left) * rw;
    e[13] = -(top + bottom) * rh;
    e[14] = -(far + near) * rd;
    e[15] = 1;
    return this;
  }
  /** Multiply the orthographic projection matrix from the right. */
  ortho(left, right, bottom, top, near, far) {
    return this.concat(new Matrix4().setOrtho(left, right, bottom, top, near, far));
  }
  /** Set the perspective projection matrix by fovy and aspect. */
  setPerspective(fovy, aspect, near, far) {
    if (near === far || aspect === 0) throw new Error("null frustum");
    if (near <= 0) throw new Error("near <= 0");
    if (far <= 0) throw new Error("far <= 0");
    const halfFovy = Math.PI * fovy / 180 / 2;
    const s = Math.sin(halfFovy);
    if (s === 0) throw new Error("null frustum");
    const rd = 1 / (far - near);
    const ct = Math.cos(halfFovy) / s;
    const e = this.elements;
    e[0] = ct / aspect;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = ct;
    e[6] = 0;
    e[7] = 0;
    e[8] = 0;
    e[9] = 0;
    e[10] = -(far + near) * rd;
    e[11] = -1;
    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;
    return this;
  }
  /** Multiply the perspective projection matrix from the right. */
  perspective(fovy, aspect, near, far) {
    return this.concat(new Matrix4().setPerspective(fovy, aspect, near, far));
  }
  /** Set the matrix for scaling. */
  setScale(x, y, z) {
    const e = this.elements;
    e[0] = x;
    e[4] = 0;
    e[8] = 0;
    e[12] = 0;
    e[1] = 0;
    e[5] = y;
    e[9] = 0;
    e[13] = 0;
    e[2] = 0;
    e[6] = 0;
    e[10] = z;
    e[14] = 0;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
    return this;
  }
  /** Multiply the matrix for scaling from the right. */
  scale(x, y, z) {
    const e = this.elements;
    e[0] *= x;
    e[4] *= y;
    e[8] *= z;
    e[1] *= x;
    e[5] *= y;
    e[9] *= z;
    e[2] *= x;
    e[6] *= y;
    e[10] *= z;
    e[3] *= x;
    e[7] *= y;
    e[11] *= z;
    return this;
  }
  /** Set the matrix for translation. */
  setTranslate(x, y, z) {
    const e = this.elements;
    e[0] = 1;
    e[4] = 0;
    e[8] = 0;
    e[12] = x;
    e[1] = 0;
    e[5] = 1;
    e[9] = 0;
    e[13] = y;
    e[2] = 0;
    e[6] = 0;
    e[10] = 1;
    e[14] = z;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
    return this;
  }
  /** Multiply the matrix for translation from the right. */
  translate(x, y, z) {
    const e = this.elements;
    e[12] += e[0] * x + e[4] * y + e[8] * z;
    e[13] += e[1] * x + e[5] * y + e[9] * z;
    e[14] += e[2] * x + e[6] * y + e[10] * z;
    e[15] += e[3] * x + e[7] * y + e[11] * z;
    return this;
  }
  /** Set the matrix for rotation. Angle in degrees. */
  setRotate(angle, x, y, z) {
    const rad = Math.PI * angle / 180;
    const e = this.elements;
    let s = Math.sin(rad);
    const c = Math.cos(rad);
    if (0 !== x && 0 === y && 0 === z) {
      if (x < 0) s = -s;
      e[0] = 1;
      e[4] = 0;
      e[8] = 0;
      e[12] = 0;
      e[1] = 0;
      e[5] = c;
      e[9] = -s;
      e[13] = 0;
      e[2] = 0;
      e[6] = s;
      e[10] = c;
      e[14] = 0;
      e[3] = 0;
      e[7] = 0;
      e[11] = 0;
      e[15] = 1;
    } else if (0 === x && 0 !== y && 0 === z) {
      if (y < 0) s = -s;
      e[0] = c;
      e[4] = 0;
      e[8] = s;
      e[12] = 0;
      e[1] = 0;
      e[5] = 1;
      e[9] = 0;
      e[13] = 0;
      e[2] = -s;
      e[6] = 0;
      e[10] = c;
      e[14] = 0;
      e[3] = 0;
      e[7] = 0;
      e[11] = 0;
      e[15] = 1;
    } else if (0 === x && 0 === y && 0 !== z) {
      if (z < 0) s = -s;
      e[0] = c;
      e[4] = -s;
      e[8] = 0;
      e[12] = 0;
      e[1] = s;
      e[5] = c;
      e[9] = 0;
      e[13] = 0;
      e[2] = 0;
      e[6] = 0;
      e[10] = 1;
      e[14] = 0;
      e[3] = 0;
      e[7] = 0;
      e[11] = 0;
      e[15] = 1;
    } else {
      let len = Math.sqrt(x * x + y * y + z * z);
      if (len !== 1) {
        const rlen = 1 / len;
        x *= rlen;
        y *= rlen;
        z *= rlen;
      }
      const nc = 1 - c;
      const xy = x * y, yz = y * z, zx = z * x;
      const xs = x * s, ys = y * s, zs = z * s;
      e[0] = x * x * nc + c;
      e[1] = xy * nc + zs;
      e[2] = zx * nc - ys;
      e[3] = 0;
      e[4] = xy * nc - zs;
      e[5] = y * y * nc + c;
      e[6] = yz * nc + xs;
      e[7] = 0;
      e[8] = zx * nc + ys;
      e[9] = yz * nc - xs;
      e[10] = z * z * nc + c;
      e[11] = 0;
      e[12] = 0;
      e[13] = 0;
      e[14] = 0;
      e[15] = 1;
    }
    return this;
  }
  /** Multiply the matrix for rotation from the right. Angle in degrees. */
  rotate(angle, x, y, z) {
    return this.concat(new Matrix4().setRotate(angle, x, y, z));
  }
  /** Set the viewing matrix. */
  setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    let fx = centerX - eyeX;
    let fy = centerY - eyeY;
    let fz = centerZ - eyeZ;
    const rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;
    let sx = fy * upZ - fz * upY;
    let sy = fz * upX - fx * upZ;
    let sz = fx * upY - fy * upX;
    const rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;
    const ux = sy * fz - sz * fy;
    const uy = sz * fx - sx * fz;
    const uz = sx * fy - sy * fx;
    const e = this.elements;
    e[0] = sx;
    e[1] = ux;
    e[2] = -fx;
    e[3] = 0;
    e[4] = sy;
    e[5] = uy;
    e[6] = -fy;
    e[7] = 0;
    e[8] = sz;
    e[9] = uz;
    e[10] = -fz;
    e[11] = 0;
    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;
    return this.translate(-eyeX, -eyeY, -eyeZ);
  }
  /** Multiply the viewing matrix from the right. */
  lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    return this.concat(
      new Matrix4().setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
    );
  }
  /** Multiply the matrix for projecting vertex to plane from the right. */
  dropShadow(plane, light) {
    const mat = new Matrix4();
    const e = mat.elements;
    const dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2] + plane[3] * light[3];
    e[0] = dot - light[0] * plane[0];
    e[1] = -light[1] * plane[0];
    e[2] = -light[2] * plane[0];
    e[3] = -light[3] * plane[0];
    e[4] = -light[0] * plane[1];
    e[5] = dot - light[1] * plane[1];
    e[6] = -light[2] * plane[1];
    e[7] = -light[3] * plane[1];
    e[8] = -light[0] * plane[2];
    e[9] = -light[1] * plane[2];
    e[10] = dot - light[2] * plane[2];
    e[11] = -light[3] * plane[2];
    e[12] = -light[0] * plane[3];
    e[13] = -light[1] * plane[3];
    e[14] = -light[2] * plane[3];
    e[15] = dot - light[3] * plane[3];
    return this.concat(mat);
  }
  /** Multiply the matrix for projecting vertex to plane from the right (parallel light). */
  dropShadowDirectionally(normX, normY, normZ, planeX, planeY, planeZ, lightX, lightY, lightZ) {
    const a = planeX * normX + planeY * normY + planeZ * normZ;
    return this.dropShadow([normX, normY, normZ, -a], [lightX, lightY, lightZ, 0]);
  }
  /** Set the perspective projection matrix from frustum bounds. */
  setFrustum(left, right, bottom, top, near, far) {
    if (left === right || top === bottom || near === far) throw new Error("null frustum");
    if (near <= 0) throw new Error("near <= 0");
    if (far <= 0) throw new Error("far <= 0");
    const rw = 1 / (right - left);
    const rh = 1 / (top - bottom);
    const rd = 1 / (far - near);
    const e = this.elements;
    e[0] = 2 * near * rw;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = 2 * near * rh;
    e[6] = 0;
    e[7] = 0;
    e[8] = (right + left) * rw;
    e[9] = (top + bottom) * rh;
    e[10] = -(far + near) * rd;
    e[11] = -1;
    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;
    return this;
  }
  /** Multiply the perspective projection matrix from the right. */
  frustum(left, right, bottom, top, near, far) {
    return this.concat(new Matrix4().setFrustum(left, right, bottom, top, near, far));
  }
}
class Vector3 {
  constructor(opt_src) {
    __publicField(this, "elements");
    const v = new Float32Array(3);
    if (opt_src && typeof opt_src === "object") {
      v[0] = opt_src[0];
      v[1] = opt_src[1];
      v[2] = opt_src[2];
    }
    this.elements = v;
  }
  /** Normalize this vector in place. */
  normalize() {
    const v = this.elements;
    const c = v[0], d = v[1], e = v[2];
    let g = Math.sqrt(c * c + d * d + e * e);
    if (g) {
      if (g === 1) return this;
    } else {
      v[0] = 0;
      v[1] = 0;
      v[2] = 0;
      return this;
    }
    g = 1 / g;
    v[0] = c * g;
    v[1] = d * g;
    v[2] = e * g;
    return this;
  }
}
class Vector4 {
  constructor(opt_src) {
    __publicField(this, "elements");
    const v = new Float32Array(4);
    if (opt_src && typeof opt_src === "object") {
      v[0] = opt_src[0];
      v[1] = opt_src[1];
      v[2] = opt_src[2];
      v[3] = opt_src[3];
    }
    this.elements = v;
  }
}
class Camera {
  constructor(editor) {
    __publicField(this, "panX", 0);
    __publicField(this, "panY", 0);
    __publicField(this, "zoom", 1);
    __publicField(this, "_animating", false);
    __publicField(this, "_targetPanX", 0);
    __publicField(this, "_targetPanY", 0);
    __publicField(this, "_targetZoom", 1);
    __publicField(this, "_viewMatrix", new Matrix4());
    this.editor = editor;
  }
  /** Translate the viewport by (dx, dy) in screen pixels. */
  pan(dx, dy) {
    this._animating = false;
    this.panX += dx;
    this.panY += dy;
  }
  /**
   * Zoom toward/away from a specific screen point so that the world position
   * under the mouse cursor stays fixed after the zoom.
   */
  zoomAt(mouseX, mouseY, deltaY) {
    this._animating = false;
    const sensitivity = 1e-3;
    const factor = 1 - deltaY * sensitivity;
    const newZoom = Math.max(0.1, Math.min(this.zoom * factor, 5));
    const scaleChange = newZoom / this.zoom;
    this.panX = mouseX - (mouseX - this.panX) * scaleChange;
    this.panY = mouseY - (mouseY - this.panY) * scaleChange;
    this.zoom = newZoom;
  }
  /**
   * Convert a screen-space coordinate to a world-space coordinate.
   * Used to correctly place nodes when adding or dragging, regardless of pan/zoom.
   */
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.panX) / this.zoom,
      y: (sy - this.panY) / this.zoom
    };
  }
  /**
   * Convert a world-space coordinate to a screen-space coordinate.
   * Used for floating DOM or Canvas overlay rendering.
   */
  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.panX,
      y: wy * this.zoom + this.panY
    };
  }
  /**
   * Smoothly animate the camera to a target pan/zoom state.
   * The animation is driven by exponential easing in getViewMatrix(),
   * which is called every frame - no extra requestAnimationFrame needed.
   * User pan/zoom input cancels the animation.
   */
  animateTo(panX, panY, zoom) {
    this._targetPanX = panX;
    this._targetPanY = panY;
    this._targetZoom = Math.max(0.1, Math.min(zoom, 5));
    this._animating = true;
    if (this.editor)
      this.editor.cameraDirty = true;
  }
  /**
   * Compute and return the current view matrix.
   * When animating, each frame moves 12% closer to the target,
   * creating a smooth exponential ease-out.
   */
  getViewMatrix() {
    if (this._animating) {
      const ease = 0.1;
      this.panX += (this._targetPanX - this.panX) * ease;
      this.panY += (this._targetPanY - this.panY) * ease;
      this.zoom += (this._targetZoom - this.zoom) * ease;
      if (Math.abs(this.panX - this._targetPanX) < 0.5 && Math.abs(this.panY - this._targetPanY) < 0.5 && Math.abs(this.zoom - this._targetZoom) < 1e-3) {
        this.panX = this._targetPanX;
        this.panY = this._targetPanY;
        this.zoom = this._targetZoom;
        if (this.editor)
          this.editor.cameraDirty = false;
        this._animating = false;
      }
    }
    this._viewMatrix.setIdentity();
    this._viewMatrix.translate(this.panX, this.panY, 0);
    this._viewMatrix.scale(this.zoom, this.zoom, 1);
    return this._viewMatrix;
  }
}
class EdgeStore {
  constructor() {
    __publicField(this, "edges", /* @__PURE__ */ new Map());
    __publicField(this, "adjacency", /* @__PURE__ */ new Map());
    __publicField(this, "_nextId", 0);
  }
  get nextEdgeId() {
    return this._nextId + 1;
  }
  allEdges() {
    return [...this.edges.values()];
  }
  /** Remove all edges and reset internal counters. Used during graph import. */
  clear() {
    this.edges.clear();
    this.adjacency.clear();
    this._nextId = 0;
  }
  /**
   * Ensure the internal ID counter is at least `value`.
   * Called after graph import so new edges get IDs above the imported max.
   */
  restoreIdCounter(value) {
    this._nextId = Math.max(this._nextId, value);
  }
  get(id) {
    return this.edges.get(id);
  }
  hasConnection(nodeId, side) {
    const sideMap = this.adjacency.get(nodeId);
    if (!sideMap) return false;
    const edgeIds = sideMap.get(side);
    return Boolean(edgeIds && edgeIds.size > 0);
  }
  add(params) {
    const {
      sourceNodeId,
      sourceHandleSide,
      targetNodeId,
      targetHandleSide,
      sourceCanHaveMultipleConnections = false,
      targetCanHaveMultipleConnections = false,
      edgeType = "orthogonal",
      headType = "arrow",
      headSkinId = "arrow",
      label = "",
      isSelected = false,
      visible = true,
      idOverride
    } = params;
    if (sourceNodeId === targetNodeId) return null;
    if (!sourceCanHaveMultipleConnections && this.hasConnection(sourceNodeId, sourceHandleSide)) return null;
    if (!targetCanHaveMultipleConnections && this.hasConnection(targetNodeId, targetHandleSide)) return null;
    const existing = this.findEdgeByEndpoints(
      sourceNodeId,
      sourceHandleSide,
      targetNodeId,
      targetHandleSide
    );
    if (existing) return existing;
    const id = idOverride ?? ++this._nextId;
    this._nextId = Math.max(this._nextId, id);
    const edge = {
      id,
      sourceNodeId,
      sourceHandleSide,
      targetNodeId,
      targetHandleSide,
      edgeType,
      headType,
      headSkinId,
      label,
      isSelected,
      visible
    };
    this.edges.set(id, edge);
    this.addAdjacency(id, sourceNodeId, sourceHandleSide);
    this.addAdjacency(id, targetNodeId, targetHandleSide);
    return edge;
  }
  remove(id) {
    const edge = this.edges.get(id);
    if (!edge) return null;
    this.removeAdjacency(id, edge.sourceNodeId, edge.sourceHandleSide);
    this.removeAdjacency(id, edge.targetNodeId, edge.targetHandleSide);
    this.edges.delete(id);
    return edge;
  }
  removeEdgesForNode(nodeId) {
    const sideMap = this.adjacency.get(nodeId);
    if (!sideMap) return [];
    const edgeIds = /* @__PURE__ */ new Set();
    for (const ids of sideMap.values()) {
      for (const edgeId of ids) {
        edgeIds.add(edgeId);
      }
    }
    const removed = [];
    for (const edgeId of edgeIds) {
      const edge = this.remove(edgeId);
      if (edge) removed.push(edge);
    }
    return removed;
  }
  removeEdgesForNodes(nodeIds) {
    const edgeIds = /* @__PURE__ */ new Set();
    for (const nodeId of nodeIds) {
      const sideMap = this.adjacency.get(nodeId);
      if (!sideMap) continue;
      for (const ids of sideMap.values()) {
        for (const edgeId of ids) {
          edgeIds.add(edgeId);
        }
      }
    }
    const removed = [];
    for (const edgeId of edgeIds) {
      const edge = this.remove(edgeId);
      if (edge) removed.push(edge);
    }
    return removed;
  }
  findEdgeByEndpoints(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide) {
    for (const edge of this.edges.values()) {
      if (edge.sourceNodeId === sourceNodeId && edge.sourceHandleSide === sourceHandleSide && edge.targetNodeId === targetNodeId && edge.targetHandleSide === targetHandleSide) {
        return edge;
      }
    }
    return void 0;
  }
  addAdjacency(edgeId, nodeId, side) {
    let sideMap = this.adjacency.get(nodeId);
    if (!sideMap) {
      sideMap = /* @__PURE__ */ new Map();
      this.adjacency.set(nodeId, sideMap);
    }
    let edgeIds = sideMap.get(side);
    if (!edgeIds) {
      edgeIds = /* @__PURE__ */ new Set();
      sideMap.set(side, edgeIds);
    }
    edgeIds.add(edgeId);
  }
  removeAdjacency(edgeId, nodeId, side) {
    const sideMap = this.adjacency.get(nodeId);
    if (!sideMap) return;
    const edgeIds = sideMap.get(side);
    if (!edgeIds) return;
    edgeIds.delete(edgeId);
    if (edgeIds.size === 0) {
      sideMap.delete(side);
    }
    if (sideMap.size === 0) {
      this.adjacency.delete(nodeId);
    }
  }
}
function getHandleScreenGeometry(worldX, worldY, node, handle, zoom, panX, panY) {
  const originX = worldX * zoom + panX;
  const originY = worldY * zoom + panY;
  const radius = handle.style.size / 2;
  let centerX = originX + node.width * zoom / 2;
  let centerY = originY + node.height * zoom / 2;
  if (node.nodeType === "branch") {
    switch (handle.side) {
      case "top":
        centerX = originX + node.width * zoom / 2;
        centerY = originY + 8 * zoom - HANDLE_LAYOUT.offsetY;
        break;
      case "left":
        centerX = originX + node.width * zoom * 0.2 - HANDLE_LAYOUT.offsetX;
        centerY = originY + node.height * zoom * 0.55;
        break;
      case "right":
        centerX = originX + node.width * zoom * 0.8 + HANDLE_LAYOUT.offsetX;
        centerY = originY + node.height * zoom * 0.55;
        break;
      case "bottom":
        centerX = originX + node.width * zoom / 2;
        centerY = originY + node.height * zoom + HANDLE_LAYOUT.offsetY;
        break;
    }
  } else {
    switch (handle.side) {
      case "left":
        centerX = originX - HANDLE_LAYOUT.offsetX;
        break;
      case "right":
        centerX = originX + node.width * zoom + HANDLE_LAYOUT.offsetX;
        break;
      case "top":
        centerY = originY - HANDLE_LAYOUT.offsetY;
        break;
      case "bottom":
        centerY = originY + node.height * zoom + HANDLE_LAYOUT.offsetY;
        break;
    }
  }
  return {
    centerX,
    centerY,
    radius,
    size: handle.style.size,
    shape: handle.style.shape
  };
}
function isPointInsideHandle(screenX, screenY, geometry) {
  if (geometry.shape === "circle") {
    const dx = screenX - geometry.centerX;
    const dy = screenY - geometry.centerY;
    return dx * dx + dy * dy <= geometry.radius * geometry.radius;
  }
  const halfSize = geometry.size / 2;
  return Math.abs(screenX - geometry.centerX) <= halfSize && Math.abs(screenY - geometry.centerY) <= halfSize;
}
function getWorldPosition(nodeId, nodes, registry) {
  const node = nodes.get(nodeId);
  if (!node) return { x: 0, y: 0 };
  let x = node.localX;
  let y = node.localY;
  let currentParentId = node.parentId;
  while (currentParentId !== null) {
    const parent = nodes.get(currentParentId);
    if (!parent) break;
    const contributes = registry ? registry.contributesToChildWorldPosition(parent.nodeType) : parent.nodeType !== "subgraph";
    if (contributes) {
      x += parent.localX;
      y += parent.localY;
    }
    currentParentId = parent.parentId;
  }
  return { x, y };
}
function getParentFrameWorldPosition(parentId, nodes, registry) {
  if (parentId === null) return { x: 0, y: 0 };
  const parent = nodes.get(parentId);
  if (!parent) return { x: 0, y: 0 };
  const contributes = registry ? registry.contributesToChildWorldPosition(parent.nodeType) : parent.nodeType !== "subgraph";
  if (!contributes) {
    return getParentFrameWorldPosition(parent.parentId, nodes, registry);
  }
  return getWorldPosition(parentId, nodes, registry);
}
function reparent(childId, newParentId, nodes, registry) {
  var _a2, _b;
  const child = nodes.get(childId);
  if (!child) return false;
  if (child.parentId === newParentId) {
    return true;
  }
  if (registry) {
    if (!registry.canReparentTo(child.nodeType, newParentId !== null ? ((_a2 = nodes.get(newParentId)) == null ? void 0 : _a2.nodeType) ?? null : null)) {
      return false;
    }
    if (newParentId === null && !((_b = registry.get(child.nodeType)) == null ? void 0 : _b.canBeRoot)) {
      return false;
    }
  } else {
    if (newParentId === null) {
      if (child.nodeType === "composition" || child.nodeType === "composition-child") {
        return false;
      }
    } else {
      const newParent = nodes.get(newParentId);
      if (!newParent) return false;
      if (!isContainerNodeType(newParent.nodeType)) return false;
      if (child.nodeType === "group") {
        if (newParent.nodeType !== "subgraph") return false;
      }
      if (child.nodeType === "hub") {
        if (newParent.nodeType === "group") return false;
      }
      if (child.nodeType === "composition") {
        if (newParent.nodeType !== "group" && newParent.nodeType !== "subgraph") return false;
      }
      if (child.nodeType === "composition-child") {
        if (newParent.nodeType !== "composition") return false;
      }
      if (child.nodeType === "node") {
        if (newParent.nodeType === "composition") return false;
      }
      if (child.nodeType === "subgraph") {
        if (newParent.nodeType === "composition") return false;
      }
    }
  }
  if (newParentId !== null) {
    const newParent = nodes.get(newParentId);
    if (!newParent) return false;
    if (!registry && !isContainerNodeType(newParent.nodeType)) return false;
    if (registry && !registry.isContainer(newParent.nodeType)) return false;
  }
  if (newParentId !== null && isAncestor(newParentId, childId, nodes)) return false;
  const childWorld = getWorldPosition(childId, nodes, registry);
  if (child.parentId !== null) {
    const oldParent = nodes.get(child.parentId);
    if (oldParent) {
      oldParent.childIds = oldParent.childIds.filter((id) => id !== childId);
    }
  }
  if (newParentId !== null) {
    const newParent = nodes.get(newParentId);
    if (!newParent) return false;
    const newParentWorld = getParentFrameWorldPosition(newParentId, nodes, registry);
    child.localX = childWorld.x - newParentWorld.x;
    child.localY = childWorld.y - newParentWorld.y;
    if (newParent && !newParent.childIds.includes(childId)) {
      newParent.childIds.push(childId);
    }
  } else {
    child.localX = childWorld.x;
    child.localY = childWorld.y;
  }
  child.parentId = newParentId;
  return true;
}
function isAncestor(ancestorId, nodeId, nodes) {
  let current = nodes.get(nodeId);
  while (current && current.parentId !== null) {
    if (current.parentId === ancestorId) return true;
    current = nodes.get(current.parentId);
  }
  return false;
}
function buildEdgeRouteGeometry(edge, store, camera) {
  const sourceNode = store.get(edge.sourceNodeId);
  const targetNode = store.get(edge.targetNodeId);
  if (!sourceNode || !targetNode) return null;
  const sourceHandle = sourceNode.handles.find(
    (handle) => handle.side === edge.sourceHandleSide
  );
  const targetHandle = targetNode.handles.find(
    (handle) => handle.side === edge.targetHandleSide
  );
  if (!sourceHandle || !targetHandle) return null;
  const sourceWorld = getHandleWorldPoint(sourceNode.id, sourceHandle, store, camera);
  const targetWorld = getHandleWorldPoint(targetNode.id, targetHandle, store, camera);
  const route = buildCubicRoute(
    sourceWorld,
    edge.sourceHandleSide,
    targetWorld,
    edge.targetHandleSide
  );
  const screenPoints = route.worldPoints.map((point) => camera.worldToScreen(point.x, point.y));
  const labelWorldPoint = getPolylineMidpoint(route.worldPoints);
  const labelScreenPoint = camera.worldToScreen(labelWorldPoint.x, labelWorldPoint.y);
  return {
    edge,
    worldPoints: route.worldPoints,
    screenPoints,
    labelWorldPoint,
    labelScreenPoint,
    arrowhead: edge.headType === "arrow" ? route.arrowhead : null
  };
}
function buildConnectionPreviewGeometry(sourceNodeId, sourceHandleSide, screenX, screenY, store, camera) {
  const sourceNode = store.get(sourceNodeId);
  if (!sourceNode) return null;
  const sourceHandle = sourceNode.handles.find((handle) => handle.side === sourceHandleSide);
  if (!sourceHandle) return null;
  const sourceWorld = getHandleWorldPoint(sourceNode.id, sourceHandle, store, camera);
  const targetWorld = camera.screenToWorld(screenX, screenY);
  const oppositeSide = getOppositeSide(sourceHandleSide);
  const route = buildOrthogonalRoute(sourceWorld, sourceHandleSide, targetWorld, oppositeSide);
  const screenPoints = route.worldPoints.map((point) => camera.worldToScreen(point.x, point.y));
  const labelWorldPoint = getPolylineMidpoint(route.worldPoints);
  const labelScreenPoint = camera.worldToScreen(labelWorldPoint.x, labelWorldPoint.y);
  return {
    edge: {
      id: -1,
      sourceNodeId,
      sourceHandleSide,
      targetNodeId: -1,
      targetHandleSide: oppositeSide,
      edgeType: "orthogonal",
      headType: "none",
      headSkinId: "arrow",
      label: "",
      isSelected: false,
      visible: true
    },
    worldPoints: route.worldPoints,
    screenPoints,
    labelWorldPoint,
    labelScreenPoint,
    arrowhead: null
  };
}
function hitTestEdgePolyline(screenX, screenY, polyline, thresholdPx = 8) {
  if (polyline.length < 2) return false;
  const thresholdSq = thresholdPx * thresholdPx;
  for (let i = 0; i < polyline.length - 1; i++) {
    if (distancePointToSegmentSquared(screenX, screenY, polyline[i], polyline[i + 1]) <= thresholdSq) {
      return true;
    }
  }
  return false;
}
function buildCubicRoute(sourceWorld, sourceSide, targetWorld, targetSide, edgeType) {
  {
    return buildOrthogonalRoute(sourceWorld, sourceSide, targetWorld, targetSide);
  }
}
function buildEdgeHeadGeometry(tip, previousPoint, tangentOverride) {
  const tangent = normalize(
    {
      x: tip.x - previousPoint.x,
      y: tip.y - previousPoint.y
    }
  );
  if (tangent.x === 0 && tangent.y === 0) return null;
  return {
    tip,
    tangent
  };
}
function getHandleWorldPoint(nodeId, handle, store, camera) {
  const node = store.get(nodeId);
  if (!node) return { x: 0, y: 0 };
  const { x, y } = getWorldPosition(node.id, store.allNodesMap);
  const geometry = getHandleScreenGeometry(x, y, node, handle, camera.zoom, camera.panX, camera.panY);
  return camera.screenToWorld(geometry.centerX, geometry.centerY);
}
function getPolylineMidpoint(points) {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  let total = 0;
  const lengths = [0];
  for (let i = 0; i < points.length - 1; i++) {
    total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    lengths.push(total);
  }
  const halfway = total / 2;
  for (let i = 0; i < lengths.length - 1; i++) {
    if (lengths[i + 1] < halfway) continue;
    const segmentLength = lengths[i + 1] - lengths[i];
    const ratio = segmentLength === 0 ? 0 : (halfway - lengths[i]) / segmentLength;
    return {
      x: lerp(points[i].x, points[i + 1].x, ratio),
      y: lerp(points[i].y, points[i + 1].y, ratio)
    };
  }
  return points[points.length - 1];
}
function getOppositeSide(side) {
  switch (side) {
    case "left":
      return "right";
    case "right":
      return "left";
    case "top":
      return "bottom";
    case "bottom":
      return "top";
  }
}
function sideVector(side) {
  switch (side) {
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
    case "top":
      return { x: 0, y: -1 };
    case "bottom":
      return { x: 0, y: 1 };
  }
}
function buildOrthogonalRoute(sourceWorld, sourceSide, targetWorld, targetSide) {
  const padding = 32;
  const v1 = sideVector(sourceSide);
  const v2 = sideVector(targetSide);
  const p1 = { x: sourceWorld.x + v1.x * padding, y: sourceWorld.y + v1.y * padding };
  const p2 = { x: targetWorld.x + v2.x * padding, y: targetWorld.y + v2.y * padding };
  const points = [sourceWorld];
  const sourceIsHoriz = sourceSide === "left" || sourceSide === "right";
  const targetIsHoriz = targetSide === "left" || targetSide === "right";
  if (sourceIsHoriz && targetIsHoriz) {
    if (v1.x !== v2.x) {
      if ((p2.x - p1.x) * v1.x >= 0) {
        const midX = (p1.x + p2.x) / 2;
        points.push({ x: midX, y: p1.y }, { x: midX, y: p2.y });
      } else {
        const midY = (p1.y + p2.y) / 2;
        points.push(p1, { x: p1.x, y: midY }, { x: p2.x, y: midY }, p2);
      }
    } else {
      const outX = v1.x === 1 ? Math.max(p1.x, p2.x) : Math.min(p1.x, p2.x);
      points.push({ x: outX, y: p1.y }, { x: outX, y: p2.y });
    }
  } else if (!sourceIsHoriz && !targetIsHoriz) {
    if (v1.y !== v2.y) {
      if ((p2.y - p1.y) * v1.y >= 0) {
        const midY = (p1.y + p2.y) / 2;
        points.push({ x: p1.x, y: midY }, { x: p2.x, y: midY });
      } else {
        const midX = (p1.x + p2.x) / 2;
        points.push(p1, { x: midX, y: p1.y }, { x: midX, y: p2.y }, p2);
      }
    } else {
      const outY = v1.y === 1 ? Math.max(p1.y, p2.y) : Math.min(p1.y, p2.y);
      points.push({ x: p1.x, y: outY }, { x: p2.x, y: outY });
    }
  } else if (sourceIsHoriz && !targetIsHoriz) {
    if ((p2.x - p1.x) * v1.x >= 0 && (p1.y - p2.y) * v2.y >= 0) {
      points.push({ x: p2.x, y: p1.y });
    } else {
      points.push(p1, { x: p2.x, y: p1.y }, p2);
    }
  } else {
    if ((p2.y - p1.y) * v1.y >= 0 && (p1.x - p2.x) * v2.x >= 0) {
      points.push({ x: p1.x, y: p2.y });
    } else {
      points.push(p1, { x: p1.x, y: p2.y }, p2);
    }
  }
  points.push(targetWorld);
  const worldPoints = filletPolyline(points, 16);
  return {
    worldPoints,
    arrowhead: buildEdgeHeadGeometry(targetWorld, worldPoints[worldPoints.length - 2])
  };
}
function filletPolyline(points, radius) {
  if (points.length <= 2) return points;
  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const origPrev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const distPrev = Math.hypot(curr.x - origPrev.x, curr.y - origPrev.y);
    const distNext = Math.hypot(next.x - curr.x, next.y - curr.y);
    const r = Math.min(radius, distPrev / 2, distNext / 2);
    if (r < 1) {
      result.push(curr);
      continue;
    }
    const startP = {
      x: curr.x + (origPrev.x - curr.x) / distPrev * r,
      y: curr.y + (origPrev.y - curr.y) / distPrev * r
    };
    const endP = {
      x: curr.x + (next.x - curr.x) / distNext * r,
      y: curr.y + (next.y - curr.y) / distNext * r
    };
    if (result.length > 0 && (result[result.length - 1].x !== startP.x || result[result.length - 1].y !== startP.y)) {
      result.push(startP);
    }
    const samples = 6;
    for (let j = 1; j <= samples; j++) {
      const t = j / samples;
      const u = 1 - t;
      result.push({
        x: u * u * startP.x + 2 * u * t * curr.x + t * t * endP.x,
        y: u * u * startP.y + 2 * u * t * curr.y + t * t * endP.y
      });
    }
  }
  result.push(points[points.length - 1]);
  return result;
}
function distancePointToSegmentSquared(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return (px - a.x) * (px - a.x) + (py - a.y) * (py - a.y);
  let t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  const distX = px - projX;
  const distY = py - projY;
  return distX * distX + distY * distY;
}
function normalize(point) {
  const length = Math.hypot(point.x, point.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: point.x / length, y: point.y / length };
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function describeNodeType(type) {
  switch (type) {
    case "group":
      return "Group";
    case "composition":
      return "Composition";
    case "composition-child":
      return "Composition child";
    case "hub":
      return "Hub";
    case "node":
    default:
      return "Node";
  }
}
class AccessibilityTree {
  constructor() {
    __publicField(this, "listElement");
    this.listElement = document.getElementById("sr-node-list");
    if (!this.listElement) {
      console.warn("Screen reader node list not found");
    }
  }
  addNode(id, label, type) {
    if (!this.listElement) return;
    const li = document.createElement("li");
    li.id = `sr-node-${id}`;
    li.textContent = `${describeNodeType(type)}: ${label}`;
    this.listElement.appendChild(li);
  }
  removeNode(id) {
    if (!this.listElement) return;
    const li = document.getElementById(`sr-node-${id}`);
    if (li) {
      li.remove();
    }
  }
  updateLabel(id, label, type) {
    if (!this.listElement) return;
    const li = document.getElementById(`sr-node-${id}`);
    if (li) {
      li.textContent = `${describeNodeType(type)}: ${label}`;
    }
  }
}
class NodeStore {
  constructor(gl, connectionMode = "node", handleStyle = DEFAULT_HANDLE_STYLE, registry) {
    /** Group nodes — drawn first (behind compositions and leaves). */
    __publicField(this, "groups", /* @__PURE__ */ new Map());
    /** Leaf nodes — drawn last (in front of groups and compositions). */
    __publicField(this, "nodes", /* @__PURE__ */ new Map());
    __publicField(this, "_nextId", 0);
    /** Per-type creation order for tiered z-ordering. */
    __publicField(this, "_groupOrder", /* @__PURE__ */ new Map());
    __publicField(this, "_nextGroupOrder", 0);
    __publicField(this, "_compositionOrder", /* @__PURE__ */ new Map());
    __publicField(this, "_nextCompositionOrder", 0);
    __publicField(this, "_leafOrder", /* @__PURE__ */ new Map());
    __publicField(this, "_nextLeafOrder", 0);
    __publicField(this, "a11yTree");
    __publicField(this, "connectionMode");
    __publicField(this, "handleStyle");
    __publicField(this, "currentTheme", "dark");
    this.gl = gl;
    this.registry = registry;
    this.a11yTree = new AccessibilityTree();
    this.connectionMode = connectionMode;
    this.handleStyle = { ...handleStyle };
  }
  getTheme() {
    return this.currentTheme;
  }
  /** Remove all nodes and reset internal counters. Used during graph import. */
  clear() {
    this.groups.clear();
    this.nodes.clear();
    this._groupOrder.clear();
    this._nextGroupOrder = 0;
    this._compositionOrder.clear();
    this._nextCompositionOrder = 0;
    this._leafOrder.clear();
    this._nextLeafOrder = 0;
    this._nextId = 0;
  }
  /**
   * Ensure the internal ID counter is at least `value`.
   * Called after graph import so new nodes get IDs above the imported max.
   */
  restoreIdCounter(value) {
    this._nextId = Math.max(this._nextId, value);
  }
  /** The id that the next call to add() will assign. Useful for labelling. */
  get nextNodeId() {
    return this._nextId + 1;
  }
  /**
   * Returns a combined Map view of all nodes (containers + leaves).
   * Used by scene-graph functions that need to traverse the full tree.
   */
  get allNodesMap() {
    const combined = /* @__PURE__ */ new Map();
    this.groups.forEach((node, id) => combined.set(id, node));
    this.nodes.forEach((node, id) => combined.set(id, node));
    return combined;
  }
  /** O(1) lookup across both maps. */
  get(id) {
    return this.nodes.get(id) ?? this.groups.get(id);
  }
  /**
   * Returns the ids that would be removed by `remove(id)`.
   *
   * Container nodes cascade to descendants. Leaf nodes may still have
   * descendants in the current tree model, but those children are promoted
   * rather than deleted.
   */
  collectRemovedIds(id) {
    const node = this.get(id);
    if (!node) return [];
    if (!isContainerNodeType(node.nodeType)) {
      return [id];
    }
    const removedIds = [id];
    for (const childId of node.childIds) {
      removedIds.push(...this.collectRemovedIds(childId));
    }
    return removedIds;
  }
  /** Create a new node at world coordinates (localX, localY). */
  add(localX, localY, text, theme, nodeType = "node", idOverride) {
    var _a2;
    const id = idOverride ?? ++this._nextId;
    this._nextId = Math.max(this._nextId, id);
    const desc = (_a2 = this.registry) == null ? void 0 : _a2.get(nodeType);
    const zTier = (desc == null ? void 0 : desc.zTier) ?? 0.4;
    if (zTier < 0.1) {
      this._groupOrder.set(id, this._nextGroupOrder++);
    } else if (zTier >= 0.1 && zTier < 0.3) {
      this._compositionOrder.set(id, this._nextCompositionOrder++);
    } else {
      this._leafOrder.set(id, this._nextLeafOrder++);
    }
    const defaultSize = desc ? desc.defaultSize : getDefaultNodeSize(nodeType);
    const { width, height } = defaultSize;
    const node = this.createNodeRecord({
      id,
      localX,
      localY,
      width,
      height,
      text,
      theme,
      nodeType,
      parentId: null
    });
    this.insertNode(node);
    return node;
  }
  setConnectionMode(connectionMode) {
    if (this.connectionMode === connectionMode) return;
    this.connectionMode = connectionMode;
    for (const node of this.allNodesMap.values()) {
      node.handles = this.createHandleState(node.id, node.nodeType, node.handles);
    }
  }
  setHandleStyle(handleStyle) {
    this.handleStyle = { ...handleStyle };
    for (const node of this.allNodesMap.values()) {
      node.handles = this.createHandleState(node.id, node.nodeType, node.handles);
    }
  }
  /**
   * Duplicate a normal node into a composition as a composition-child.
   * The source node remains untouched; the clone is returned so callers can
   * select or further manipulate it.
   */
  duplicateIntoComposition(sourceId, compositionId, theme) {
    const source = this.get(sourceId);
    const composition = this.get(compositionId);
    if (!source || !composition) return null;
    if (!isNodePrimitiveType(source.nodeType)) return null;
    if (composition.nodeType !== "composition") return null;
    const world = getWorldPosition(source.id, this.allNodesMap, this.registry);
    const clone = this.add(world.x, world.y, source.text, theme, "composition-child");
    if (!this.setParent(clone.id, composition.id)) {
      this.remove(clone.id);
      return null;
    }
    this.updateContainerBounds(composition.id, theme);
    return clone;
  }
  /**
   * Remove a node and free its GPU texture.
   * Container nodes cascade to their descendants. Leaf nodes still keep the
   * old promotion path as a safety net for future leaf variants.
   */
  remove(id) {
    const node = this.get(id);
    if (!node) return;
    if (isContainerNodeType(node.nodeType)) {
      const childrenToRemove = [...node.childIds];
      for (const childId of childrenToRemove) {
        this.remove(childId);
      }
    } else {
      const allNodes = this.allNodesMap;
      const childrenToReparent = [...node.childIds];
      for (const childId of childrenToReparent) {
        reparent(childId, node.parentId, allNodes, this.registry);
        const child = allNodes.get(childId);
        if (child) {
          this.syncNodePresentation(childId);
          this.syncToMap(child);
        }
      }
    }
    if (node.parentId !== null) {
      const parent = this.get(node.parentId);
      if (parent) {
        parent.childIds = parent.childIds.filter((childId) => childId !== id);
      }
    }
    this.groups.delete(id);
    this.nodes.delete(id);
    switch (node.nodeType) {
      case "group":
      case "subgraph":
        this._groupOrder.delete(id);
        break;
      case "composition":
        this._compositionOrder.delete(id);
        break;
      default:
        this._leafOrder.delete(id);
        break;
    }
    this.a11yTree.removeNode(id);
  }
  /**
   * Removes a container while preserving its children in their current visual
   * positions by promoting them to the removed container's parent.
   */
  removeContainerOnly(id) {
    const node = this.get(id);
    if (!node || !isContainerNodeType(node.nodeType)) return false;
    const parentId = node.parentId;
    const allNodes = this.allNodesMap;
    for (const childId of [...node.childIds]) {
      reparent(childId, parentId, allNodes, this.registry);
      const child = allNodes.get(childId);
      if (child) {
        this.syncNodePresentation(childId);
        this.syncToMap(child);
      }
    }
    if (parentId !== null) {
      const parent = this.get(parentId);
      if (parent) {
        parent.childIds = parent.childIds.filter((childId) => childId !== id);
      }
    }
    node.childIds = [];
    this.groups.delete(id);
    this.nodes.delete(id);
    this._groupOrder.delete(id);
    this._compositionOrder.delete(id);
    this._leafOrder.delete(id);
    this.a11yTree.removeNode(id);
    return true;
  }
  /**
   * Compute the z-value for a node using tiered per-type creation order.
   *
   * Three tiers keep subgraphs behind the rest of the scene:
   *   Subgraphs     → base z = -0.05 - subgraphIdx * Z_STEP (lowest)
   *   Groups        → base z = groupIdx * Z_STEP
   *   Compositions  → base z = Z_COMP_TIER + compIdx * Z_STEP
   *   Leaves        → base z = Z_LEAF_TIER + leafIdx * Z_STEP (highest)
   *
   * Selected non-container nodes and children of selected containers
   * get Z_SELECTION_BOOST to render on top of everything.
   */
  getZForNode(nodeId, selectedNodeIds) {
    var _a2;
    const Z_STEP = 1e-3;
    const Z_SELECTION_BOOST = 0.5;
    const node = this.get(nodeId);
    if (!node) return 0;
    let baseZ;
    const zTier = (_a2 = this.registry) == null ? void 0 : _a2.getZTier(node.nodeType);
    if (zTier !== void 0) {
      if (zTier < 0) {
        baseZ = zTier - (this._groupOrder.get(nodeId) ?? 0) * Z_STEP;
      } else if (zTier < 0.1) {
        baseZ = (this._groupOrder.get(nodeId) ?? 0) * Z_STEP;
      } else if (zTier < 0.3) {
        baseZ = zTier + (this._compositionOrder.get(nodeId) ?? 0) * Z_STEP;
      } else {
        baseZ = zTier + (this._leafOrder.get(nodeId) ?? 0) * Z_STEP;
      }
    } else {
      const Z_COMP_TIER = 0.2;
      const Z_LEAF_TIER = 0.4;
      switch (node.nodeType) {
        case "subgraph":
          baseZ = -0.05 - (this._groupOrder.get(nodeId) ?? 0) * Z_STEP;
          break;
        case "group":
          baseZ = (this._groupOrder.get(nodeId) ?? 0) * Z_STEP;
          break;
        case "composition":
          baseZ = Z_COMP_TIER + (this._compositionOrder.get(nodeId) ?? 0) * Z_STEP;
          break;
        default:
          baseZ = Z_LEAF_TIER + (this._leafOrder.get(nodeId) ?? 0) * Z_STEP;
          break;
      }
    }
    const isContainer = this.registry ? this.registry.isContainer(node.nodeType) : isContainerNodeType(node.nodeType);
    if (selectedNodeIds.has(nodeId) && !isContainer) {
      return baseZ + Z_SELECTION_BOOST;
    }
    let currentId = node.parentId;
    while (currentId !== null) {
      if (selectedNodeIds.has(currentId)) {
        return baseZ + Z_SELECTION_BOOST;
      }
      const parent = this.get(currentId);
      if (!parent) break;
      currentId = parent.parentId;
    }
    return baseZ;
  }
  /** Returns the currently selected node, if any. */
  getSelected() {
    for (const node of this.groups.values()) {
      if (node.isSelected) return node;
    }
    for (const node of this.nodes.values()) {
      if (node.isSelected) return node;
    }
    return void 0;
  }
  /** Deselect every node. */
  deselectAll() {
    this.groups.forEach((node) => node.isSelected = false);
    this.nodes.forEach((node) => node.isSelected = false);
  }
  /** Clear isDropTarget on every node. */
  clearDropTargets() {
    this.groups.forEach((node) => node.isDropTarget = false);
    this.nodes.forEach((node) => node.isDropTarget = false);
  }
  /** Rebuild textures for all nodes under a new theme. */
  regenerateTextures(theme) {
    this.currentTheme = theme;
  }
  /** Update the label text of a node and regenerate its texture. */
  updateLabel(id, newLabel, theme) {
    const node = this.get(id);
    if (!node) return;
    node.text = newLabel;
    this.currentTheme = theme;
    this.a11yTree.updateLabel(id, newLabel, node.nodeType);
  }
  updateHandleConnectionState(nodeId, side, isConnected) {
    const node = this.get(nodeId);
    if (!node) return;
    const handle = node.handles.find((entry) => entry.side === side);
    if (!handle || handle.isConnected === isConnected) return;
    handle.isConnected = isConnected;
  }
  setCompositionReference(nodeId, compositionId, theme) {
    const node = this.get(nodeId);
    const composition = this.get(compositionId);
    if (!node || !composition) return false;
    if (node.nodeType !== "node" || composition.nodeType !== "composition") return false;
    if (node.parentId === null) return false;
    node.compositionRefId = compositionId;
    node.textureIds = getCompositionReferenceTextureIds();
    this.currentTheme = theme;
    this.syncNodePresentation(nodeId);
    return true;
  }
  clearCompositionReference(nodeId, theme) {
    const node = this.get(nodeId);
    if (!node || node.nodeType !== "node" || node.compositionRefId === null) {
      return false;
    }
    node.compositionRefId = null;
    node.textureIds = getDefaultTextureIds("node");
    this.currentTheme = theme;
    this.syncNodePresentation(nodeId);
    return true;
  }
  getCompositionReferenceNodes(compositionId) {
    const refs = [];
    for (const node of this.nodes.values()) {
      if (node.nodeType === "node" && node.compositionRefId === compositionId) {
        refs.push(node);
      }
    }
    return refs;
  }
  refreshCompositionReferences(compositionId, theme) {
    for (const node of this.getCompositionReferenceNodes(compositionId)) {
      this.syncNodePresentation(node.id);
    }
  }
  /** Assign a new parent to a child node, preserving world position. */
  setParent(childId, newParentId) {
    const changed = reparent(childId, newParentId, this.allNodesMap, this.registry);
    if (!changed) return false;
    this.syncNodePresentation(childId);
    return true;
  }
  /** Restore a node to an exact local position and parent. */
  restoreNodePlacement(childId, localX, localY, parentId) {
    const node = this.get(childId);
    if (!node) return false;
    if (parentId !== null) {
      const parent = this.get(parentId);
      if (!parent || !isContainerNodeType(parent.nodeType)) return false;
      if (node.nodeType === "hub" && parent.nodeType === "group") return false;
    }
    if (node.parentId !== null) {
      const currentParent = this.get(node.parentId);
      if (currentParent) {
        currentParent.childIds = currentParent.childIds.filter(
          (id) => id !== childId
        );
      }
    }
    node.localX = localX;
    node.localY = localY;
    node.parentId = parentId;
    if (parentId !== null) {
      const parent = this.get(parentId);
      if (parent && !parent.childIds.includes(childId)) {
        parent.childIds.push(childId);
      }
    }
    this.syncNodePresentation(childId);
    return true;
  }
  /** Restore a node without re-validating the historical parent relationship. */
  forceRestoreNodePlacement(childId, localX, localY, parentId) {
    const node = this.get(childId);
    if (!node) return false;
    if (parentId !== null) {
      const parent = this.get(parentId);
      if (!parent || !isContainerNodeType(parent.nodeType)) return false;
      if (node.nodeType === "hub" && parent.nodeType === "group") return false;
    }
    if (node.parentId !== null) {
      const currentParent = this.get(node.parentId);
      if (currentParent) {
        currentParent.childIds = currentParent.childIds.filter(
          (id) => id !== childId
        );
      }
    }
    node.localX = localX;
    node.localY = localY;
    node.parentId = parentId;
    if (parentId !== null) {
      const parent = this.get(parentId);
      if (parent && !parent.childIds.includes(childId)) {
        parent.childIds.push(childId);
      }
    }
    this.syncNodePresentation(childId);
    return true;
  }
  /**
   * Translates the direct children of `rootId` by the same world delta.
   *
   * Collapsed subgraphs use this so the shell and direct children stay
   * aligned while nested descendants keep their relative offsets through
   * the normal parent chain.
   */
  translateDescendants(rootId, deltaX, deltaY) {
    if (deltaX === 0 && deltaY === 0) return;
    const root = this.get(rootId);
    if (!root) return;
    const visit = (node) => {
      for (const childId of node.childIds) {
        const child = this.get(childId);
        if (!child) continue;
        child.localX += deltaX;
        child.localY += deltaY;
        if (child.nodeType === "subgraph") {
          visit(child);
        }
      }
    };
    visit(root);
  }
  /**
   * All visible nodes in render order:
   * subgraphs first, then groups, compositions, and leaves.
   */
  visibleNodes() {
    const result = [];
    this.groups.forEach((node) => {
      if (node.visible && node.nodeType === "subgraph" && this.isEffectivelyVisible(node.id)) result.push(node);
    });
    this.groups.forEach((node) => {
      if (node.visible && node.nodeType === "group" && this.isEffectivelyVisible(node.id)) result.push(node);
    });
    this.groups.forEach((node) => {
      if (node.visible && node.nodeType === "composition" && this.isEffectivelyVisible(node.id)) result.push(node);
    });
    this.nodes.forEach((node) => {
      if (node.visible && this.isEffectivelyVisible(node.id)) result.push(node);
    });
    return result;
  }
  isEffectivelyVisible(nodeId) {
    const node = this.get(nodeId);
    if (!node || !node.visible) return false;
    let currentId = node.parentId;
    while (currentId !== null) {
      const parent = this.get(currentId);
      if (!parent || !parent.visible) return false;
      if (parent.nodeType === "subgraph" && parent.isCollapsed) return false;
      currentId = parent.parentId;
    }
    return true;
  }
  /** Re-calculates bounds of a container node based on its children. */
  updateContainerBounds(containerId, theme) {
    const container = this.groups.get(containerId);
    if (!container || !isContainerNodeType(container.nodeType)) return;
    if (container.nodeType === "subgraph") {
      this.updateSubgraphBounds(container);
      return;
    }
    const defaultSize = getDefaultNodeSize(container.nodeType);
    if (container.childIds.length === 0) {
      container.width = defaultSize.width;
      container.height = defaultSize.height;
      return;
    }
    const paddingX = 0;
    const paddingY = 50;
    const paddingBottom = 40;
    const gapY = 10;
    let totalChildHeight = 0;
    let maxChildWidth = 0;
    const children = container.childIds.map((id) => this.get(id)).filter((node) => Boolean(node));
    for (const child of children) {
      maxChildWidth = Math.max(maxChildWidth, child.width);
      totalChildHeight += child.height;
    }
    totalChildHeight += Math.max(0, children.length - 1) * gapY;
    container.width = Math.max(defaultSize.width, maxChildWidth + paddingX * 2);
    container.height = Math.max(
      defaultSize.height,
      totalChildHeight + paddingY + paddingBottom
    );
    let currentY = paddingY;
    for (const child of children) {
      child.localX = (container.width - child.width) / 2;
      child.localY = currentY;
      currentY += child.height + gapY;
    }
  }
  /** Compatibility wrapper for the previous group-specific API. */
  updateGroupBounds(groupId, theme) {
    this.updateContainerBounds(groupId, theme);
  }
  /** Ensure a node is stored in the correct map based on its nodeType. */
  syncToMap(node) {
    const isContainer = this.registry ? this.registry.isContainer(node.nodeType) : isContainerNodeType(node.nodeType);
    if (isContainer) {
      this.groups.set(node.id, node);
    } else {
      this.nodes.set(node.id, node);
    }
  }
  insertNode(node) {
    this.syncToMap(node);
    this.a11yTree.addNode(node.id, node.text, node.nodeType);
  }
  syncNodePresentation(nodeId) {
    const node = this.get(nodeId);
    if (!node) return;
    if (!isNodePrimitiveType(node.nodeType)) {
      return;
    }
    const shouldCollapse = this.shouldCollapseNode(node);
    const { width, height } = this.getPresentedNodeSize(node, shouldCollapse);
    const expectedTextureIds = node.compositionRefId !== null ? getCompositionReferenceTextureIds() : getDefaultTextureIds(node.nodeType);
    node.width = width;
    node.height = height;
    node.textureIds = expectedTextureIds;
  }
  shouldCollapseNode(node) {
    if (node.compositionRefId !== null) return false;
    if (node.nodeType === "composition-child") return true;
    if (!isNodePrimitiveType(node.nodeType)) return false;
    if (node.parentId === null) return false;
    const parent = this.get(node.parentId);
    return (parent == null ? void 0 : parent.nodeType) === "group";
  }
  getPresentedNodeSize(node, shouldCollapse) {
    if (node.nodeType === "node" && node.compositionRefId !== null) {
      const composition = this.get(node.compositionRefId);
      if ((composition == null ? void 0 : composition.nodeType) === "composition") {
        return {
          width: composition.width,
          height: composition.height
        };
      }
      return getDefaultNodeSize("composition");
    }
    const defaultSize = getDefaultNodeSize(node.nodeType, shouldCollapse, this.registry);
    if (node.nodeType === "node" && !shouldCollapse && node.props) {
      return { width: defaultSize.width, height: this.calculatePropHeight(node.props) };
    }
    return defaultSize;
  }
  getCompositionReferencePreviewChildren(node) {
    if (node.nodeType !== "node" || node.compositionRefId === null) {
      return null;
    }
    const composition = this.get(node.compositionRefId);
    if (!composition || composition.nodeType !== "composition") {
      return [];
    }
    return composition.childIds.map((childId) => this.get(childId)).filter((child) => Boolean(child)).map((child) => ({
      text: child.text,
      width: child.width,
      height: child.height
    }));
  }
  createHandleState(candidateId, nodeType, existingHandles = []) {
    if (this.registry) {
      if (!this.registry.hasHandles(nodeType, this.connectionMode)) return [];
      const desc = this.registry.get(nodeType);
      return desc.handles.sides.map((side) => {
        var _a2;
        return {
          candidateId,
          side,
          isConnected: ((_a2 = existingHandles.find((handle) => handle.side === side)) == null ? void 0 : _a2.isConnected) ?? false,
          style: { ...this.handleStyle }
        };
      });
    }
    if (nodeType === "branch") {
      return ["top", "left", "right"].map((side) => {
        var _a2;
        return {
          candidateId,
          side,
          isConnected: ((_a2 = existingHandles.find((handle) => handle.side === side)) == null ? void 0 : _a2.isConnected) ?? false,
          style: { ...this.handleStyle }
        };
      });
    }
    if (nodeType === "subgraph" || isNodePrimitiveType(nodeType)) {
      return ["left", "right"].map((side) => {
        var _a2;
        return {
          candidateId,
          side,
          isConnected: ((_a2 = existingHandles.find((handle) => handle.side === side)) == null ? void 0 : _a2.isConnected) ?? false,
          style: { ...this.handleStyle }
        };
      });
    }
    if (!isCandidateNodeType(nodeType, this.connectionMode)) return [];
    return ["left", "right"].map((side) => {
      var _a2;
      return {
        candidateId,
        side,
        isConnected: ((_a2 = existingHandles.find((handle) => handle.side === side)) == null ? void 0 : _a2.isConnected) ?? false,
        style: { ...this.handleStyle }
      };
    });
  }
  createNodeRecord(params) {
    var _a2, _b;
    const {
      id,
      localX,
      localY,
      width,
      height,
      text,
      theme,
      nodeType,
      parentId,
      visible = true,
      isSelected = false,
      isDropTarget = false,
      isLocked = false,
      isCollapsed = false
    } = params;
    const r = id & 255;
    const g = id >> 8 & 255;
    const b = id >> 16 & 255;
    const handles = this.createHandleState(id, nodeType);
    const desc = (_a2 = this.registry) == null ? void 0 : _a2.get(nodeType);
    const textureIds = desc ? { ...desc.defaultTextureIds } : getDefaultTextureIds(nodeType);
    const props = (desc == null ? void 0 : desc.createDefaultProps) ? desc.createDefaultProps() : nodeType === "node" ? this.createDefaultProps() : void 0;
    const result = {
      id,
      localX,
      localY,
      width,
      height,
      text,
      textureIds,
      pickColor: [r / 255, g / 255, b / 255],
      isSelected,
      visible,
      parentId,
      childIds: [],
      nodeType,
      compositionRefId: null,
      isDropTarget,
      isLocked,
      isCollapsed,
      handles,
      props
    };
    if (result.props) {
      const desc2 = (_b = this.registry) == null ? void 0 : _b.get(nodeType);
      if (desc2 == null ? void 0 : desc2.calculateHeight) {
        result.height = desc2.calculateHeight(result);
      } else if (nodeType === "node") {
        result.height = this.calculatePropHeight(result.props);
      }
    }
    return result;
  }
  updateSubgraphBounds(subgraph) {
    const collapsed = Boolean(subgraph.isCollapsed);
    const defaultSize = getDefaultNodeSize("subgraph", collapsed);
    if (collapsed || subgraph.childIds.length === 0) {
      subgraph.width = defaultSize.width;
      subgraph.height = defaultSize.height;
      return;
    }
    const padding = 24;
    const titleHeight = 42;
    const parentWorld = getParentFrameWorldPosition(
      subgraph.parentId,
      this.allNodesMap,
      this.registry
    );
    const children = subgraph.childIds.map((id) => this.get(id)).filter((node) => Boolean(node));
    if (children.length === 0) {
      subgraph.width = defaultSize.width;
      subgraph.height = defaultSize.height;
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const child of children) {
      const childWorld = getWorldPosition(child.id, this.allNodesMap);
      const childX = childWorld.x - parentWorld.x;
      const childY = childWorld.y - parentWorld.y;
      minX = Math.min(minX, childX);
      minY = Math.min(minY, childY);
      maxX = Math.max(maxX, childX + child.width);
      maxY = Math.max(maxY, childY + child.height);
    }
    subgraph.localX = minX - padding - parentWorld.x;
    subgraph.localY = minY - titleHeight - parentWorld.y;
    subgraph.width = maxX - minX + padding * 2;
    subgraph.height = maxY - minY + titleHeight + padding;
  }
  calculatePropHeight(props) {
    var _a2, _b, _c, _d, _e, _f;
    let lineCount = 0;
    lineCount += ((_a2 = props.booleans["ungrouped"]) == null ? void 0 : _a2.length) ?? 0;
    lineCount += ((_b = props.texts["ungrouped"]) == null ? void 0 : _b.length) ?? 0;
    lineCount += ((_c = props.enums["ungrouped"]) == null ? void 0 : _c.length) ?? 0;
    for (let i = 0; i < props.groups.length; i++) {
      const g = props.groups[i];
      const bc = ((_d = props.booleans[g]) == null ? void 0 : _d.length) ?? 0;
      const tc = ((_e = props.texts[g]) == null ? void 0 : _e.length) ?? 0;
      const ec = ((_f = props.enums[g]) == null ? void 0 : _f.length) ?? 0;
      const total = bc + tc + ec;
      if (total > 0) {
        lineCount += 1 + total;
      }
    }
    return 30 + 16 + lineCount * 20 + 16;
  }
  createDefaultProps() {
    return {
      groups: ["Appearance", "Data", "Meta"],
      booleans: {
        "ungrouped": [{ label: "Visible", value: true, uiPrimitive: "checkbox" }, { label: "Primary", value: false, uiPrimitive: "checkbox" }],
        "Appearance": [{ label: "Shadow", value: true, uiPrimitive: "checkbox" }]
      },
      texts: {
        "Data": [{ label: "Value", value: "0", uiPrimitive: "range" }, { label: "default", value: "0", uiPrimitive: "range" }]
      },
      enums: {
        "Appearance": [{ label: "Size", value: "Medium", uiPrimitive: "select", options: ["Medium", "Large", "ExtraLarge"] }],
        "Meta": [{ label: "Depth", value: "Deep", uiPrimitive: "select", options: ["Shallow", "Steep", "Deep"] }]
      }
    };
  }
}
const ATLAS_COLUMNS = 4;
const ATLAS_ROWS = 1;
const CELL_SIZE = 128;
const SKIN_LAYOUTS = [
  {
    id: "arrow",
    draw: (ctx, size) => {
      const cx = size / 2;
      const cy = size / 2;
      const headLength = size * 0.58;
      const headWidth = size * 0.52;
      const stemWidth = size * 0.18;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.beginPath();
      ctx.moveTo(cx + headLength * 0.5, cy);
      ctx.lineTo(cx - headLength * 0.15, cy - headWidth * 0.5);
      ctx.lineTo(cx - headLength * 0.15, cy - stemWidth * 0.5);
      ctx.lineTo(cx - headLength * 0.48, cy - stemWidth * 0.5);
      ctx.lineTo(cx - headLength * 0.48, cy + stemWidth * 0.5);
      ctx.lineTo(cx - headLength * 0.15, cy + stemWidth * 0.5);
      ctx.lineTo(cx - headLength * 0.15, cy + headWidth * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  },
  {
    id: "chevron",
    draw: (ctx, size) => {
      const cx = size / 2;
      const cy = size / 2;
      const w = size * 0.55;
      const h = size * 0.38;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
      ctx.lineWidth = size * 0.12;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.35, cy - h);
      ctx.lineTo(cx + w * 0.28, cy);
      ctx.lineTo(cx - w * 0.35, cy + h);
      ctx.stroke();
    }
  },
  {
    id: "diamond",
    draw: (ctx, size) => {
      const cx = size / 2;
      const cy = size / 2;
      const w = size * 0.45;
      const h = size * 0.34;
      ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
      ctx.beginPath();
      ctx.moveTo(cx + w, cy);
      ctx.lineTo(cx, cy - h);
      ctx.lineTo(cx - w, cy);
      ctx.lineTo(cx, cy + h);
      ctx.closePath();
      ctx.fill();
    }
  },
  {
    id: "pill",
    draw: (ctx, size) => {
      const cx = size / 2;
      const cy = size / 2;
      const width = size * 0.64;
      const height = size * 0.26;
      ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
      ctx.beginPath();
      ctx.roundRect(cx - width / 2, cy - height / 2, width, height, height / 2);
      ctx.fill();
    }
  }
];
class EdgeHeadTextureLibrary {
  constructor(gl) {
    __publicField(this, "texture");
    __publicField(this, "regions");
    this.gl = gl;
    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = CELL_SIZE * ATLAS_COLUMNS;
    atlasCanvas.height = CELL_SIZE * ATLAS_ROWS;
    const ctx = atlasCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to create 2D context for edge-head atlas");
    }
    ctx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);
    ctx.save();
    ctx.translate(0, 0);
    this.regions = {
      arrow: this.buildRegion(0),
      chevron: this.buildRegion(1),
      diamond: this.buildRegion(2),
      pill: this.buildRegion(3)
    };
    for (let i = 0; i < SKIN_LAYOUTS.length; i++) {
      const skin = SKIN_LAYOUTS[i];
      const cellX = i * CELL_SIZE;
      ctx.save();
      ctx.translate(cellX, 0);
      skin.draw(ctx, CELL_SIZE);
      ctx.restore();
    }
    ctx.restore();
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error("Unable to allocate edge-head texture atlas");
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      atlasCanvas
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.texture = texture;
  }
  getRegion(skinId) {
    return this.regions[skinId] ?? this.regions.arrow;
  }
  buildRegion(index) {
    const u0 = index / ATLAS_COLUMNS;
    const u1 = (index + 1) / ATLAS_COLUMNS;
    return {
      u0,
      v0: 0,
      u1,
      v1: 1
    };
  }
}
class TextureCache {
  constructor(gl, onTextureLoaded) {
    __publicField(this, "gl");
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    __publicField(this, "uploadQueue", []);
    __publicField(this, "currentFrame", 0);
    // If we want to force redraws when promises resolve
    __publicField(this, "onTextureLoaded");
    this.gl = gl;
    this.onTextureLoaded = onTextureLoaded;
  }
  getTexture(textureId) {
    let entry = this.cache.get(textureId);
    if (!entry) {
      entry = {
        state: "PENDING",
        texture: null,
        nativeWidth: 0,
        nativeHeight: 0,
        lastUsedFrame: this.currentFrame
      };
      this.cache.set(textureId, entry);
      const source = TextureRegistry.get(textureId);
      if (source) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(source.svgText, "image/svg+xml");
        const svg = doc.documentElement;
        const viewBox = svg.getAttribute("viewBox");
        let nativeWidth = 96;
        let nativeHeight = 64;
        if (viewBox) {
          const parts = viewBox.split(/[ ,]+/);
          if (parts.length >= 4) {
            nativeWidth = parseFloat(parts[2]);
            nativeHeight = parseFloat(parts[3]);
          }
        }
        const logicalScale = 2;
        const logicalWidth = nativeWidth * logicalScale;
        const logicalHeight = nativeHeight * logicalScale;
        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const rasterScale = Math.max(4, Math.round(2 * dpr));
        const width = nativeWidth * rasterScale;
        const height = nativeHeight * rasterScale;
        svg.setAttribute("width", width.toString());
        svg.setAttribute("height", height.toString());
        svg.setAttribute("preserveAspectRatio", "none");
        const modifiedSvgText = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          this.uploadQueue.push({ id: textureId, image: img, logicalWidth, logicalHeight });
          this.onTextureLoaded();
        };
        img.onerror = (err) => {
          console.error(`Failed to rasterize texture ${textureId}:`, err);
          const failedEntry = this.cache.get(textureId);
          if (failedEntry) failedEntry.state = "FAILED";
        };
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(modifiedSvgText)}`;
      } else {
        entry.state = "FAILED";
      }
    }
    entry.lastUsedFrame = this.currentFrame;
    if (entry.state === "READY") {
      return entry;
    }
    return null;
  }
  processUploads() {
    this.currentFrame++;
    const MAX_UPLOADS = 2;
    let uploadsDone = 0;
    while (this.uploadQueue.length > 0 && uploadsDone < MAX_UPLOADS) {
      const { id, image, logicalWidth, logicalHeight } = this.uploadQueue.shift();
      const entry = this.cache.get(id);
      if (entry && entry.state === "PENDING") {
        const tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.pixelStorei(this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.NONE);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          image
        );
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        entry.texture = tex;
        entry.nativeWidth = logicalWidth;
        entry.nativeHeight = logicalHeight;
        entry.state = "READY";
        uploadsDone++;
        this.onTextureLoaded();
      }
    }
    for (const [key, entry] of this.cache.entries()) {
      if (entry.state === "READY" && this.currentFrame - entry.lastUsedFrame > 600) {
        if (entry.texture) {
          this.gl.deleteTexture(entry.texture);
        }
        this.cache.delete(key);
      }
    }
  }
  dispose() {
    this.uploadQueue = [];
    for (const entry of this.cache.values()) {
      if (entry.texture) {
        this.gl.deleteTexture(entry.texture);
      }
    }
    this.cache.clear();
  }
  invalidateAll() {
    for (const entry of this.cache.values()) {
      if (entry.texture) {
        this.gl.deleteTexture(entry.texture);
      }
    }
    this.cache.clear();
    this.uploadQueue = [];
    this.onTextureLoaded();
  }
}
class MsdfAtlas {
  constructor(gl) {
    __publicField(this, "texture", null);
    __publicField(this, "glyphs", /* @__PURE__ */ new Map());
    __publicField(this, "common", null);
    __publicField(this, "info", null);
    __publicField(this, "pxRange", 4);
    this.gl = gl;
  }
  async load(imageUrl, jsonUrl) {
    const [image, json] = await Promise.all([
      this.loadImage(imageUrl),
      fetch(jsonUrl).then((r) => r.json())
    ]);
    this.common = json.common;
    this.info = json.info;
    if (json.distanceField && json.distanceField.distanceRange) {
      this.pxRange = json.distanceField.distanceRange;
    }
    for (const char of json.chars) {
      this.glyphs.set(char.id, char);
    }
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.texture = tex;
  }
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}
class MsdfTextRenderer {
  constructor(gl, program, locations, atlas) {
    __publicField(this, "vertexBuffer");
    __publicField(this, "indexBuffer");
    // vertex: [x, y, u, v, r, g, b, a, z] = 9 floats per vertex
    __publicField(this, "vertexData");
    __publicField(this, "indexData");
    __publicField(this, "vertexCount", 0);
    __publicField(this, "indexCount", 0);
    __publicField(this, "maxQuads", 1e4);
    __publicField(this, "_currentZ", 0);
    this.gl = gl;
    this.program = program;
    this.locations = locations;
    this.atlas = atlas;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.vertexData = new Float32Array(this.maxQuads * 4 * 9);
    this.indexData = new Uint16Array(this.maxQuads * 6);
  }
  beginBatch() {
    this.vertexCount = 0;
    this.indexCount = 0;
    this._currentZ = 0;
  }
  _setZ(z) {
    this._currentZ = z;
  }
  addText(text, x, y, fontSize, r, g, b, a, align = "left", baseline = "alphabetic") {
    if (!this.atlas.common || !this.atlas.info) return;
    const scale = fontSize / this.atlas.info.size;
    const { scaleW, scaleH, lineHeight, base } = this.atlas.common;
    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const glyph = this.atlas.glyphs.get(code);
      if (glyph) {
        totalWidth += glyph.xadvance * scale;
      }
    }
    let cursorX = x;
    if (align === "center") cursorX -= totalWidth / 2;
    else if (align === "right") cursorX -= totalWidth;
    let cursorY = y;
    if (baseline === "middle") cursorY -= lineHeight / 2 * scale;
    else if (baseline === "bottom") cursorY -= lineHeight * scale;
    else if (baseline === "alphabetic") cursorY -= base * scale;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const glyph = this.atlas.glyphs.get(code);
      if (!glyph) continue;
      if (glyph.width > 0 && glyph.height > 0) {
        if (this.indexCount / 6 >= this.maxQuads) {
          this.flush();
        }
        const x0 = cursorX + glyph.xoffset * scale;
        const y0 = cursorY + glyph.yoffset * scale;
        const x1 = x0 + glyph.width * scale;
        const y1 = y0 + glyph.height * scale;
        const u0 = glyph.x / scaleW;
        const v0 = glyph.y / scaleH;
        const u1 = (glyph.x + glyph.width) / scaleW;
        const v1 = (glyph.y + glyph.height) / scaleH;
        const vIdx = this.vertexCount;
        const iIdx = this.indexCount;
        const stride = 9;
        this.vertexData[vIdx * stride + 0] = x0;
        this.vertexData[vIdx * stride + 1] = y0;
        this.vertexData[vIdx * stride + 2] = u0;
        this.vertexData[vIdx * stride + 3] = v0;
        this.vertexData[vIdx * stride + 4] = r;
        this.vertexData[vIdx * stride + 5] = g;
        this.vertexData[vIdx * stride + 6] = b;
        this.vertexData[vIdx * stride + 7] = a;
        this.vertexData[vIdx * stride + 8] = this._currentZ;
        this.vertexData[vIdx * stride + 9] = x1;
        this.vertexData[vIdx * stride + 10] = y0;
        this.vertexData[vIdx * stride + 11] = u1;
        this.vertexData[vIdx * stride + 12] = v0;
        this.vertexData[vIdx * stride + 13] = r;
        this.vertexData[vIdx * stride + 14] = g;
        this.vertexData[vIdx * stride + 15] = b;
        this.vertexData[vIdx * stride + 16] = a;
        this.vertexData[vIdx * stride + 17] = this._currentZ;
        this.vertexData[vIdx * stride + 18] = x1;
        this.vertexData[vIdx * stride + 19] = y1;
        this.vertexData[vIdx * stride + 20] = u1;
        this.vertexData[vIdx * stride + 21] = v1;
        this.vertexData[vIdx * stride + 22] = r;
        this.vertexData[vIdx * stride + 23] = g;
        this.vertexData[vIdx * stride + 24] = b;
        this.vertexData[vIdx * stride + 25] = a;
        this.vertexData[vIdx * stride + 26] = this._currentZ;
        this.vertexData[vIdx * stride + 27] = x0;
        this.vertexData[vIdx * stride + 28] = y1;
        this.vertexData[vIdx * stride + 29] = u0;
        this.vertexData[vIdx * stride + 30] = v1;
        this.vertexData[vIdx * stride + 31] = r;
        this.vertexData[vIdx * stride + 32] = g;
        this.vertexData[vIdx * stride + 33] = b;
        this.vertexData[vIdx * stride + 34] = a;
        this.vertexData[vIdx * stride + 35] = this._currentZ;
        this.indexData[iIdx + 0] = vIdx + 0;
        this.indexData[iIdx + 1] = vIdx + 1;
        this.indexData[iIdx + 2] = vIdx + 2;
        this.indexData[iIdx + 3] = vIdx + 0;
        this.indexData[iIdx + 4] = vIdx + 2;
        this.indexData[iIdx + 5] = vIdx + 3;
        this.vertexCount += 4;
        this.indexCount += 6;
      }
      cursorX += glyph.xadvance * scale;
    }
  }
  flush(camera, projMatrix) {
    if (this.indexCount === 0 || !this.atlas.texture) return;
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.vertexData.subarray(0, this.vertexCount * 9),
      gl.DYNAMIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.indexData.subarray(0, this.indexCount),
      gl.DYNAMIC_DRAW
    );
    const stride = Float32Array.BYTES_PER_ELEMENT * 9;
    gl.vertexAttribPointer(
      this.locations.a_Position,
      2,
      gl.FLOAT,
      false,
      stride,
      0
    );
    gl.enableVertexAttribArray(this.locations.a_Position);
    gl.vertexAttribPointer(
      this.locations.a_TexCoord,
      2,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 2
    );
    gl.enableVertexAttribArray(this.locations.a_TexCoord);
    gl.vertexAttribPointer(
      this.locations.a_Color,
      4,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 4
    );
    gl.enableVertexAttribArray(this.locations.a_Color);
    gl.vertexAttribPointer(
      this.locations.a_Z,
      1,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 8
    );
    gl.enableVertexAttribArray(this.locations.a_Z);
    if (camera && projMatrix) {
      gl.uniformMatrix4fv(
        this.locations.u_ProjMatrix,
        false,
        projMatrix.elements
      );
      gl.uniformMatrix4fv(
        this.locations.u_ViewMatrix,
        false,
        camera.getViewMatrix().elements
      );
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.atlas.texture);
    gl.uniform1i(this.locations.u_Atlas, 0);
    gl.uniform1f(this.locations.u_pxRange, this.atlas.pxRange || 4);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    this.vertexCount = 0;
    this.indexCount = 0;
  }
}
const SHAPE_ENUM = {
  square: 0,
  circle: 1,
  "rounded-square": 2
};
class IconBackgroundRenderer {
  constructor(gl, program, locations) {
    __publicField(this, "vertexBuffer");
    __publicField(this, "indexBuffer");
    __publicField(this, "vertexData");
    __publicField(this, "indexData");
    __publicField(this, "vertexCount", 0);
    __publicField(this, "indexCount", 0);
    __publicField(this, "msdfFontSize", null);
    __publicField(this, "maxQuads", 1e3);
    __publicField(this, "_currentZ", 0);
    this.gl = gl;
    this.program = program;
    this.locations = locations;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.vertexData = new Float32Array(this.maxQuads * 4 * 12);
    this.indexData = new Uint16Array(this.maxQuads * 6);
  }
  beginBatch() {
    this.vertexCount = 0;
    this.indexCount = 0;
    this._currentZ = 0;
  }
  _setZ(z) {
    this._currentZ = z;
  }
  addQuad(x, y, r, g, b, a, glyphWidth, glyphHeight, base, lineHeight, fontSize = 16, align = "left", baseline = "bottom", geometry = "square", z = 0) {
    if (this.msdfFontSize === null) return;
    const scale = fontSize * 2 / this.msdfFontSize;
    const scaledWidth = glyphWidth * scale;
    const scaledHeight = glyphHeight * scale;
    const padding = 2.8;
    let cursorX = x;
    if (align === "center") cursorX -= scaledWidth / 2;
    else if (align === "right") cursorX -= scaledWidth;
    let cursorY = y;
    if (baseline === "middle") cursorY = cursorY - lineHeight * (padding / glyphHeight) / 2 * scale;
    else if (baseline === "bottom") cursorY = cursorY - lineHeight * (padding / glyphHeight) * scale;
    else cursorY -= base * scale;
    const x0 = cursorX - padding;
    const y0 = cursorY - padding;
    const x1 = cursorX + scaledWidth + padding;
    const y1 = cursorY + scaledHeight + padding;
    const shapeVal = SHAPE_ENUM[geometry];
    const vIdx = this.vertexCount, iIdx = this.indexCount;
    const stride = 12;
    for (let i = 0; i < 4; i++) {
      const vOffset = (vIdx + i) * stride;
      if (i === 0) {
        this.vertexData[vOffset + 0] = x0;
        this.vertexData[vOffset + 1] = y0;
      } else if (i === 1) {
        this.vertexData[vOffset + 0] = x1;
        this.vertexData[vOffset + 1] = y0;
      } else if (i === 2) {
        this.vertexData[vOffset + 0] = x1;
        this.vertexData[vOffset + 1] = y1;
      } else {
        this.vertexData[vOffset + 0] = x0;
        this.vertexData[vOffset + 1] = y1;
      }
      this.vertexData[vOffset + 2] = r;
      this.vertexData[vOffset + 3] = g;
      this.vertexData[vOffset + 4] = b;
      this.vertexData[vOffset + 5] = a;
      this.vertexData[vOffset + 6] = shapeVal;
      this.vertexData[vOffset + 7] = x0;
      this.vertexData[vOffset + 8] = y0;
      this.vertexData[vOffset + 9] = x1;
      this.vertexData[vOffset + 10] = y1;
      this.vertexData[vOffset + 11] = this._currentZ;
    }
    this.indexData[iIdx + 0] = vIdx + 0;
    this.indexData[iIdx + 1] = vIdx + 1;
    this.indexData[iIdx + 2] = vIdx + 2;
    this.indexData[iIdx + 3] = vIdx + 0;
    this.indexData[iIdx + 4] = vIdx + 2;
    this.indexData[iIdx + 5] = vIdx + 3;
    this.vertexCount += 4;
    this.indexCount += 6;
  }
  flush(camera, projMatrix) {
    if (this.indexCount === 0) return;
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.vertexData.subarray(0, this.vertexCount * 12),
      gl.DYNAMIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.indexData.subarray(0, this.indexCount),
      gl.DYNAMIC_DRAW
    );
    const stride = Float32Array.BYTES_PER_ELEMENT * 12;
    gl.vertexAttribPointer(
      this.locations.a_Position,
      2,
      gl.FLOAT,
      false,
      stride,
      0
    );
    gl.enableVertexAttribArray(this.locations.a_Position);
    gl.vertexAttribPointer(
      this.locations.a_Color,
      4,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 2
    );
    gl.enableVertexAttribArray(this.locations.a_Color);
    gl.vertexAttribPointer(
      this.locations.a_Shape,
      1,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 6
    );
    gl.enableVertexAttribArray(this.locations.a_Shape);
    gl.vertexAttribPointer(
      this.locations.a_BBoxMin,
      2,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 7
    );
    gl.enableVertexAttribArray(this.locations.a_BBoxMin);
    gl.vertexAttribPointer(
      this.locations.a_BBoxMax,
      2,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 9
    );
    gl.enableVertexAttribArray(this.locations.a_BBoxMax);
    gl.vertexAttribPointer(
      this.locations.a_Z,
      1,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 11
    );
    gl.enableVertexAttribArray(this.locations.a_Z);
    if (camera && projMatrix) {
      gl.uniformMatrix4fv(
        this.locations.u_ViewMatrix,
        false,
        camera.getViewMatrix().elements
      );
      gl.uniformMatrix4fv(
        this.locations.u_ProjMatrix,
        false,
        projMatrix.elements
      );
    }
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    this.vertexCount = 0;
    this.indexCount = 0;
  }
}
class Renderer {
  constructor(gl, canvas, bgCanvas, program, locations, geometry, bgGeometry, store, edgeStore, camera, bgProgram, bgLocations, labelCanvas, getConnectionPreview, getBgColor, getFontColor, getSelectedNodeIds, onFrame, msdfProgram, iconBGProgram, msdfAtlas, iconAtlas, registry) {
    __publicField(this, "modelMatrix", new Matrix4());
    __publicField(this, "projMatrix", new Matrix4());
    __publicField(this, "textRenderer");
    __publicField(this, "iconRenderer");
    __publicField(this, "iconBackgroundRenderer");
    __publicField(this, "labelCtx");
    __publicField(this, "edgeVertexBuffer");
    __publicField(this, "edgeHeadBuffer");
    __publicField(this, "edgeHeadTextures");
    __publicField(this, "edgeFrame", []);
    __publicField(this, "textureCache");
    __publicField(this, "isZooming", false);
    __publicField(this, "dpr", 1);
    this.gl = gl;
    this.canvas = canvas;
    this.bgCanvas = bgCanvas;
    this.program = program;
    this.locations = locations;
    this.geometry = geometry;
    this.bgGeometry = bgGeometry;
    this.store = store;
    this.edgeStore = edgeStore;
    this.camera = camera;
    this.bgProgram = bgProgram;
    this.bgLocations = bgLocations;
    this.labelCanvas = labelCanvas;
    this.getConnectionPreview = getConnectionPreview;
    this.getBgColor = getBgColor;
    this.getFontColor = getFontColor;
    this.getSelectedNodeIds = getSelectedNodeIds;
    this.onFrame = onFrame;
    this.msdfProgram = msdfProgram;
    this.iconBGProgram = iconBGProgram;
    this.msdfAtlas = msdfAtlas;
    this.iconAtlas = iconAtlas;
    this.registry = registry;
    this.labelCtx = labelCanvas.getContext("2d");
    this.edgeVertexBuffer = gl.createBuffer();
    this.edgeHeadBuffer = gl.createBuffer();
    if (!this.edgeVertexBuffer) {
      throw new Error("Unable to allocate edge vertex buffer");
    }
    if (!this.edgeHeadBuffer) {
      throw new Error("Unable to allocate edge head buffer");
    }
    this.edgeHeadTextures = new EdgeHeadTextureLibrary(gl);
    this.textureCache = new TextureCache(gl, () => {
    });
    const msdfLocations = getMSDFShaderLocations(gl, msdfProgram);
    const iconBGLocations = getIconBGLocations(gl, iconBGProgram);
    this.textRenderer = new MsdfTextRenderer(
      gl,
      msdfProgram,
      msdfLocations,
      msdfAtlas
    );
    this.iconRenderer = new MsdfTextRenderer(
      gl,
      msdfProgram,
      msdfLocations,
      iconAtlas
    );
    this.iconBackgroundRenderer = new IconBackgroundRenderer(
      gl,
      iconBGProgram,
      iconBGLocations
    );
  }
  /** Call once after each canvas resize to update the orthographic projection. */
  resize(width, height, dpr = 1) {
    this.dpr = dpr;
    this.gl.viewport(0, 0, width, height);
    const cssWidth = width / dpr;
    const cssHeight = height / dpr;
    this.projMatrix.setOrtho(0, cssWidth, cssHeight, 0, -2, 2);
    this.bgCanvas.width = width;
    this.bgCanvas.height = height;
    this.labelCanvas.width = width;
    this.labelCanvas.height = height;
    if (this.labelCtx) {
      this.labelCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  /** Start the RAF-driven render loop. */
  startLoop() {
    requestAnimationFrame(this.tick.bind(this));
  }
  tick() {
    this.drawBGFrame();
    this.drawFrame();
    this.onFrame();
    requestAnimationFrame(this.tick.bind(this));
  }
  invalidateTextures() {
    this.textureCache.invalidateAll();
  }
  drawFrame() {
    this.textureCache.processUploads();
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.drawNodes(false);
    this.drawEdges();
    this.drawOverlay();
  }
  drawOverlay() {
    if (!this.labelCtx) return;
    this.labelCtx.save();
    this.labelCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.labelCtx.clearRect(
      0,
      0,
      this.labelCanvas.width,
      this.labelCanvas.height
    );
    this.labelCtx.restore();
    this.drawConnectionPreview();
    this.drawEdgeLabels();
    for (const node of this.store.visibleNodes()) {
      this.drawHandles(node);
    }
    if (!this.isZooming) this.drawGroupLabels();
  }
  drawConnectionPreview() {
    if (!this.labelCtx) return;
    const preview = this.getConnectionPreview();
    if (!preview) return;
    const route = buildConnectionPreviewGeometry(
      preview.sourceNodeId,
      preview.sourceHandleSide,
      preview.screenX,
      preview.screenY,
      this.store,
      this.camera
    );
    if (!route) return;
    this.labelCtx.save();
    this.labelCtx.beginPath();
    this.labelCtx.lineWidth = 2;
    this.labelCtx.strokeStyle = "rgba(228, 228, 228, 0.95)";
    this.labelCtx.setLineDash([8, 6]);
    this.labelCtx.moveTo(route.screenPoints[0].x, route.screenPoints[0].y);
    for (let i = 1; i < route.screenPoints.length; i++) {
      this.labelCtx.lineTo(route.screenPoints[i].x, route.screenPoints[i].y);
    }
    this.labelCtx.stroke();
    this.labelCtx.restore();
  }
  drawEdgeLabels() {
    if (!this.labelCtx) return;
    this.labelCtx.save();
    this.labelCtx.font = "500 12px Inter, sans-serif";
    this.labelCtx.textBaseline = "middle";
    this.labelCtx.fillStyle = "rgba(226, 232, 240, 0.95)";
    for (const route of this.edgeFrame) {
      if (!route.edge.label) continue;
      const x = route.labelScreenPoint.x;
      const y = route.labelScreenPoint.y - 12;
      const isSelected = route.edge.isSelected;
      const metrics = this.labelCtx.measureText(route.edge.label);
      const padX = 8;
      const width = metrics.width + padX * 2;
      const height = 20;
      this.labelCtx.fillStyle = isSelected ? "rgba(69, 26, 3, 0.92)" : "rgba(15, 23, 42, 0.72)";
      this.labelCtx.beginPath();
      this.labelCtx.roundRect(x - width / 2, y - height / 2, width, height, 8);
      this.labelCtx.fill();
      this.labelCtx.fillStyle = isSelected ? "rgba(255, 243, 205, 0.98)" : "rgba(226, 232, 240, 0.95)";
      this.labelCtx.fillText(route.edge.label, x - metrics.width / 2, y);
    }
    this.labelCtx.restore();
  }
  isRectInViewport(worldX, worldY, width, height, extraPadding = 0) {
    const viewportMin = this.camera.screenToWorld(0, 0);
    const viewportMax = this.camera.screenToWorld(
      this.canvas.width,
      this.canvas.height
    );
    const padding = (50 + extraPadding) / this.camera.zoom;
    viewportMin.x -= padding;
    viewportMin.y -= padding;
    viewportMax.x += padding;
    viewportMax.y += padding;
    if (worldX + width < viewportMin.x) return false;
    if (worldY + height < viewportMin.y) return false;
    if (worldX > viewportMax.x) return false;
    if (worldY > viewportMax.y) return false;
    return true;
  }
  drawGroupLabels() {
    if (!this.labelCtx) return;
    this.labelCtx.font = "600 14px Inter, sans-serif";
    this.labelCtx.textBaseline = "middle";
    for (const node of this.store.visibleNodes()) {
      if (this.registry) {
        const desc = this.registry.get(node.nodeType);
        if (!(desc == null ? void 0 : desc.usesCanvasLabel)) continue;
      } else {
        if (node.nodeType !== "group") continue;
      }
      const { x, y } = getWorldPosition(node.id, this.store.allNodesMap);
      if (!this.isRectInViewport(x, y, node.width, node.height)) continue;
      const screenPos = this.camera.worldToScreen(node.localX, node.localY);
      this.labelCtx.fillStyle = "#f8fafc";
      this.labelCtx.fillText(node.text, screenPos.x + 15, screenPos.y + 20);
    }
  }
  drawHandles(node) {
    if (!this.labelCtx || node.handles.length === 0) return;
    const { x, y } = getWorldPosition(node.id, this.store.allNodesMap);
    const zoom = this.camera.zoom;
    const { panX, panY } = this.camera;
    for (const handle of node.handles) {
      const geometry = getHandleScreenGeometry(
        x,
        y,
        node,
        handle,
        zoom,
        panX,
        panY
      );
      drawHandle(this.labelCtx, handle, geometry.centerX, geometry.centerY);
    }
  }
  drawEdges() {
    const gl = this.gl;
    const visibleEdges = this.edgeStore.allEdges().filter((edge) => edge.visible);
    this.edgeFrame = [];
    if (visibleEdges.length === 0) return;
    const lineVertices = [];
    const headVertices = [];
    const lineDraws = [];
    const headDraws = [];
    let lineCursor = 0;
    let headCursor = 0;
    const selectedIds = this.getSelectedNodeIds();
    for (const edge of visibleEdges) {
      const sourceNode = this.store.get(edge.sourceNodeId);
      const targetNode = this.store.get(edge.targetNodeId);
      if (!sourceNode || !targetNode) continue;
      if (!this.store.isEffectivelyVisible(sourceNode.id) || !this.store.isEffectivelyVisible(targetNode.id)) {
        continue;
      }
      const sourceZ = this.store.getZForNode(sourceNode.id, selectedIds);
      const targetZ = this.store.getZForNode(targetNode.id, selectedIds);
      const edgeZ = (sourceZ + targetZ) / 2;
      const sPos = getWorldPosition(sourceNode.id, this.store.allNodesMap);
      const tPos = getWorldPosition(targetNode.id, this.store.allNodesMap);
      const minX = Math.min(sPos.x, tPos.x);
      const minY = Math.min(sPos.y, tPos.y);
      const maxX = Math.max(
        sPos.x + sourceNode.width,
        tPos.x + targetNode.width
      );
      const maxY = Math.max(
        sPos.y + sourceNode.height,
        tPos.y + targetNode.height
      );
      if (!this.isRectInViewport(minX, minY, maxX - minX, maxY - minY, 100))
        continue;
      const geometry = buildEdgeRouteGeometry(edge, this.store, this.camera);
      if (!geometry || geometry.worldPoints.length < 2) continue;
      this.edgeFrame.push(geometry);
      if (edge.isSelected) continue;
      lineDraws.push({ first: lineCursor, count: geometry.worldPoints.length, z: edgeZ });
      lineCursor += geometry.worldPoints.length;
      for (const point of geometry.worldPoints) {
        lineVertices.push(point.x, point.y, edgeZ, 0, 0);
      }
      if (geometry.arrowhead) {
        const region = this.edgeHeadTextures.getRegion(edge.headSkinId);
        headDraws.push({ first: headCursor, count: 6, z: edgeZ });
        headCursor += 6;
        headVertices.push(
          ...this.buildHeadQuadVertices(geometry.arrowhead, region, edgeZ)
        );
      }
    }
    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.bindEdgeVertexBuffer(this.edgeVertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(lineVertices),
      gl.DYNAMIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.uniformMatrix4fv(
      this.locations.u_ProjMatrix,
      false,
      this.projMatrix.elements
    );
    gl.uniformMatrix4fv(
      this.locations.u_ViewMatrix,
      false,
      this.camera.getViewMatrix().elements
    );
    this.modelMatrix.setIdentity();
    gl.uniformMatrix4fv(
      this.locations.u_ModelMatrix,
      false,
      this.modelMatrix.elements
    );
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);
    gl.uniform4f(this.locations.u_Color, 0.38, 0.38, 0.39, 0.72);
    let vertexOffset = 0;
    for (const draw of lineDraws) {
      gl.drawArrays(gl.LINE_STRIP, vertexOffset, draw.count);
      vertexOffset += draw.count;
    }
    if (headVertices.length > 0) {
      this.bindEdgeVertexBuffer(this.edgeHeadBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(headVertices),
        gl.DYNAMIC_DRAW
      );
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.edgeHeadTextures.texture);
      gl.uniform1i(this.locations.u_UseTexture, 1);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform1i(this.locations.u_Sampler, 0);
      gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
      let headOffset = 0;
      for (const draw of headDraws) {
        gl.drawArrays(gl.TRIANGLES, headOffset, draw.count);
        headOffset += draw.count;
      }
    }
    const selectedEdges = visibleEdges.filter((edge) => edge.isSelected);
    for (const selectedEdge of selectedEdges) {
      const selectedGeometry = buildEdgeRouteGeometry(
        selectedEdge,
        this.store,
        this.camera
      );
      if (selectedGeometry) {
        this.drawSingleEdge(
          selectedGeometry,
          "rgba(245, 158, 11, 0.98)",
          "rgba(251, 191, 36, 1)"
        );
      }
    }
  }
  drawSingleEdge(geometry, strokeColor, headColor) {
    const gl = this.gl;
    this.bindEdgeVertexBuffer(this.edgeVertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        geometry.worldPoints.flatMap((point) => [point.x, point.y, 0, 0, 0])
      ),
      gl.DYNAMIC_DRAW
    );
    gl.uniformMatrix4fv(
      this.locations.u_ProjMatrix,
      false,
      this.projMatrix.elements
    );
    gl.uniformMatrix4fv(
      this.locations.u_ViewMatrix,
      false,
      this.camera.getViewMatrix().elements
    );
    this.modelMatrix.setIdentity();
    gl.uniformMatrix4fv(
      this.locations.u_ModelMatrix,
      false,
      this.modelMatrix.elements
    );
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);
    gl.uniform4f(this.locations.u_Color, ...this.parseColor(strokeColor));
    gl.drawArrays(gl.LINE_STRIP, 0, geometry.worldPoints.length);
    if (geometry.arrowhead) {
      const region = this.edgeHeadTextures.getRegion(geometry.edge.headSkinId);
      const quad = this.buildHeadQuadVertices(geometry.arrowhead, region);
      this.bindEdgeVertexBuffer(this.edgeHeadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.DYNAMIC_DRAW);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.edgeHeadTextures.texture);
      gl.uniform1i(this.locations.u_UseTexture, 1);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform1i(this.locations.u_Sampler, 0);
      gl.uniform4f(this.locations.u_Color, ...this.parseColor(headColor));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }
  buildHeadQuadVertices(head, region, z = 0) {
    const headLength = 18;
    const headWidth = 12;
    const halfWidth = headWidth / 2;
    const tangentX = head.tangent.x;
    const tangentY = head.tangent.y;
    const backX = -tangentX;
    const backY = -tangentY;
    const normalX = -tangentY;
    const normalY = tangentX;
    const baseX = head.tip.x + backX * headLength;
    const baseY = head.tip.y + backY * headLength;
    const topLeft = {
      x: baseX + normalX * halfWidth,
      y: baseY + normalY * halfWidth
    };
    const bottomLeft = {
      x: baseX - normalX * halfWidth,
      y: baseY - normalY * halfWidth
    };
    const bottomRight = {
      x: head.tip.x - normalX * halfWidth,
      y: head.tip.y - normalY * halfWidth
    };
    const topRight = {
      x: head.tip.x + normalX * halfWidth,
      y: head.tip.y + normalY * halfWidth
    };
    return [
      topLeft.x,
      topLeft.y,
      z,
      region.u0,
      region.v0,
      bottomLeft.x,
      bottomLeft.y,
      z,
      region.u0,
      region.v1,
      bottomRight.x,
      bottomRight.y,
      z,
      region.u1,
      region.v1,
      topLeft.x,
      topLeft.y,
      z,
      region.u0,
      region.v0,
      bottomRight.x,
      bottomRight.y,
      z,
      region.u1,
      region.v1,
      topRight.x,
      topRight.y,
      z,
      region.u1,
      region.v0
    ];
  }
  bindEdgeVertexBuffer(buffer) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(
      this.locations.a_Position,
      2,
      gl.FLOAT,
      false,
      stride,
      0
    );
    gl.enableVertexAttribArray(this.locations.a_Position);
    gl.vertexAttribPointer(
      this.locations.a_TexCoord,
      2,
      gl.FLOAT,
      false,
      stride,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.locations.a_TexCoord);
    gl.vertexAttribPointer(
      this.locations.a_Z,
      1,
      gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.locations.a_Z);
  }
  parseColor(color) {
    if (color.startsWith("rgba(")) {
      const parts = color.slice(5, -1).split(",").map((part) => part.trim());
      return [
        Number(parts[0]) / 255,
        Number(parts[1]) / 255,
        Number(parts[2]) / 255,
        Number(parts[3])
      ];
    }
    return [0.38, 0.62, 1, 1];
  }
  drawBGFrame() {
    const gl = this.gl;
    const [r, g, b, a] = this.getBgColor();
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.drawBG(false);
  }
  /**
   * Draw all visible nodes.
   * @param picking — when true, each node is drawn as a flat pick-color silhouette
   *                  (blend disabled, no texture) for the off-screen pick render pass.
   */
  drawNodes(picking) {
    var _a2, _b, _c, _d, _e, _f, _g;
    const gl = this.gl;
    gl.useProgram(this.program);
    if (picking) {
      gl.disable(gl.BLEND);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      this.textRenderer.beginBatch();
      this.iconBackgroundRenderer.beginBatch();
      this.iconRenderer.beginBatch();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.indexBuffer);
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(
      this.locations.a_Position,
      2,
      gl.FLOAT,
      false,
      stride,
      0
    );
    gl.enableVertexAttribArray(this.locations.a_Position);
    gl.vertexAttribPointer(
      this.locations.a_TexCoord,
      2,
      gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.locations.a_TexCoord);
    gl.disableVertexAttribArray(this.locations.a_Z);
    gl.uniformMatrix4fv(
      this.locations.u_ProjMatrix,
      false,
      this.projMatrix.elements
    );
    gl.uniformMatrix4fv(
      this.locations.u_ViewMatrix,
      false,
      this.camera.getViewMatrix().elements
    );
    const selectedIds = this.getSelectedNodeIds();
    for (const node of this.store.visibleNodes()) {
      const { x, y } = getWorldPosition(node.id, this.store.allNodesMap);
      if (!this.isRectInViewport(x, y, node.width, node.height)) {
        continue;
      }
      const z = this.store.getZForNode(node.id, selectedIds);
      if (!picking) {
        (_b = (_a2 = this.textRenderer)._setZ) == null ? void 0 : _b.call(_a2, z);
        (_d = (_c = this.iconBackgroundRenderer)._setZ) == null ? void 0 : _d.call(_c, z);
        (_f = (_e = this.iconRenderer)._setZ) == null ? void 0 : _f.call(_e, z);
      }
      this.drawNode(node, x, y, z, picking);
    }
    if (!picking) {
      this.iconBackgroundRenderer.msdfFontSize = ((_g = this.iconAtlas.info) == null ? void 0 : _g.size) || null;
      this.textRenderer.flush(this.camera, this.projMatrix);
      this.iconBackgroundRenderer.flush(this.camera, this.projMatrix);
      this.iconRenderer.flush(this.camera, this.projMatrix);
    }
  }
  /**
   * Draw all visible nodes.
   * @param picking — when true, each node is drawn as a flat pick-color silhouette
   *                  (blend disabled, no texture) for the off-screen pick render pass.
   */
  drawBG(picking) {
    const gl = this.gl;
    gl.useProgram(this.bgProgram);
    if (picking) {
      gl.disable(gl.BLEND);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bgGeometry.vertexBuffer);
    gl.vertexAttribPointer(
      this.bgLocations.a_Position,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.bgLocations.a_Position);
    gl.uniform4f(this.bgLocations.u_Color, 0.05, 0.05, 0.05, 0.12);
    gl.uniform1i(
      this.bgLocations.u_UsePointMask,
      this.bgGeometry.primitiveType === gl.POINTS ? 1 : 0
    );
    gl.drawArrays(this.bgGeometry.primitiveType, 0, this.bgGeometry.length);
  }
  drawNode(node, worldX, worldY, z, picking) {
    var _a2, _b, _c, _d;
    const gl = this.gl;
    if (picking) {
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform4f(
        this.locations.u_Color,
        node.pickColor[0],
        node.pickColor[1],
        node.pickColor[2],
        1
      );
      this.setModelMatrix(worldX, worldY, node.width, node.height, z);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      return;
    }
    if (this.registry) {
      const desc = this.registry.get(node.nodeType);
      if (desc == null ? void 0 : desc.rawDraw) {
        const ctx = {
          gl,
          node,
          worldX,
          worldY,
          z,
          renderer: this.getDrawAPI()
        };
        if (desc.rawDraw(ctx)) return;
      }
      if ((desc == null ? void 0 : desc.renderMode) === "rounded-rect") {
        if (node.nodeType === "hub") {
          this.drawHubNode(node, worldX, worldY, z, picking);
          return;
        }
        this.drawGenericRoundedRect(node, worldX, worldY, z, desc);
        return;
      }
      if ((desc == null ? void 0 : desc.renderMode) === "rounded-triangle") {
        this.drawBranchNode(node, worldX, worldY, z, picking, desc);
        return;
      }
    } else {
      if (node.nodeType === "subgraph") {
        this.drawSubgraphNode(node, worldX, worldY, z);
        return;
      }
      if (node.nodeType === "hub") {
        this.drawHubNode(node, worldX, worldY, z, picking);
        return;
      }
      if (node.nodeType === "branch") {
        this.drawBranchNode(node, worldX, worldY, z, picking);
        return;
      }
    }
    if (node.isDropTarget) {
      this.setModelMatrix(
        worldX - 6,
        worldY - 6,
        node.width + 12,
        node.height + 12,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform4f(this.locations.u_Color, 0.13, 0.86, 0.39, 0.8);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    } else if (node.isSelected) {
      this.setModelMatrix(
        worldX - 2,
        worldY - 2,
        node.width + 4,
        node.height + 4,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform4f(this.locations.u_Color, 0.23, 0.23, 0.86, 1);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    const bodyCache = this.textureCache.getTexture(node.textureIds.body);
    if (bodyCache) {
      this.setModelMatrix(worldX, worldY, node.width, node.height, z);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, bodyCache.texture);
      gl.uniform1i(this.locations.u_UseTexture, 1);
      gl.uniform1i(this.locations.u_Use9Slice, 1);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform2f(this.locations.u_Dimensions, node.width, node.height);
      gl.uniform2f(
        this.locations.u_TextureSize,
        bodyCache.nativeWidth,
        bodyCache.nativeHeight
      );
      gl.uniform4f(this.locations.u_SliceMargins, 16, 16, 16, 16);
      gl.uniform1i(this.locations.u_Sampler, 0);
      gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    let headHeight = node.height;
    if (this.registry) {
      const desc = this.registry.get(node.nodeType);
      headHeight = (desc == null ? void 0 : desc.category) === "leaf" ? NODE_LAYOUT.headerHeight : node.height;
    } else {
      if (node.nodeType === "node" || node.nodeType === "composition-child") {
        headHeight = NODE_LAYOUT.headerHeight;
      } else if (node.nodeType === "group" || node.nodeType === "composition") {
        headHeight = node.height;
      }
    }
    const headCache = this.textureCache.getTexture(node.textureIds.head);
    if (headCache) {
      this.setModelMatrix(worldX, worldY, node.width, headHeight, z);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, headCache.texture);
      gl.uniform1i(this.locations.u_UseTexture, 1);
      gl.uniform1i(this.locations.u_Use9Slice, 1);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform2f(this.locations.u_Dimensions, node.width, headHeight);
      gl.uniform2f(
        this.locations.u_TextureSize,
        headCache.nativeWidth,
        headCache.nativeHeight
      );
      gl.uniform4f(this.locations.u_SliceMargins, 16, 16, 16, 16);
      gl.uniform1i(this.locations.u_Sampler, 0);
      gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    if (!picking) {
      const [r, g, b, _] = this.getFontColor();
      const isCollapsed = this.store.shouldCollapseNode(node);
      const headOnly = node.nodeType === "composition-child" || isCollapsed;
      const titleY = (node.nodeType === "group" || node.nodeType === "composition") && !isCollapsed ? 20 : headOnly ? node.height / 2 : NODE_LAYOUT.headerHeight / 2;
      if (node.nodeType === "node" || node.nodeType === "composition-child" || isCollapsed) {
        this.textRenderer.addText(
          node.text,
          worldX + NODE_LAYOUT.padding,
          worldY + titleY,
          14,
          r,
          g,
          b,
          1,
          "left",
          "middle"
        );
      }
      if (node.nodeType === "group") {
        const lockX = node.width / 2;
        const lockY = NODE_LAYOUT.lockBtnTopY;
        const isLocked = Boolean(node.isLocked);
        this.iconBackgroundRenderer.addQuad(
          worldX + lockX,
          worldY + lockY + 1.2,
          r,
          g,
          b,
          isLocked ? 0.12 : 0.05,
          dumbGlyphWidth,
          dumbGlyphHeight,
          ((_a2 = this.iconAtlas.common) == null ? void 0 : _a2.base) || 0,
          ((_b = this.iconAtlas.common) == null ? void 0 : _b.lineHeight) || 0,
          16,
          "center",
          void 0,
          "circle"
        );
        this.iconRenderer.addText(
          isLocked ? "" : "",
          // Placeholder — swap with lock/unlock codepoints
          worldX + lockX,
          worldY + lockY,
          16,
          r,
          g,
          b,
          1,
          "center",
          "middle"
        );
      }
      if (node.nodeType === "group" && !isCollapsed) {
        const xPos = node.width / 2;
        const yPos = node.height - NODE_LAYOUT.plusBtnPaddingBottom;
        this.iconBackgroundRenderer.addQuad(
          worldX + xPos,
          worldY + yPos + 1.2,
          r,
          g,
          b,
          0.05,
          dumbGlyphWidth,
          dumbGlyphHeight,
          ((_c = this.iconAtlas.common) == null ? void 0 : _c.base) || 0,
          ((_d = this.iconAtlas.common) == null ? void 0 : _d.lineHeight) || 0,
          16,
          "center",
          void 0,
          "circle"
        );
        this.textRenderer.addText(
          "+",
          worldX + xPos,
          worldY + yPos,
          20,
          r,
          g,
          b,
          1,
          "center",
          "middle"
        );
      }
      if (!headOnly) {
        if (node.nodeType === "node" && node.compositionRefId !== null) {
          const padding = NODE_LAYOUT.padding;
          const spacing = 8;
          const titleHeight = 8;
          let yOffset = NODE_LAYOUT.headerHeight + padding;
          yOffset += titleHeight + spacing;
          const composition = this.store.get(node.compositionRefId);
          if (composition) {
            const children = composition.childIds.map((id) => this.store.get(id)).filter(Boolean);
            if (children.length === 0) {
              this.textRenderer.addText(
                "No nodes",
                worldX + padding,
                worldY + yOffset,
                12,
                r,
                g,
                b,
                0.5,
                "left",
                "top"
              );
            } else {
              gl.useProgram(this.program);
              for (let i = 0; i < Math.min(children.length, 5); i++) {
                const child = children[i];
                const childWidth = Math.min(child.width, node.width - 40);
                const childHeight = Math.max(
                  NODE_LAYOUT.headerHeight,
                  child.height
                );
                const x = worldX + (node.width - childWidth) / 2;
                const y = worldY + yOffset;
                const bodyCache2 = this.textureCache.getTexture(
                  child.textureIds.body
                );
                if (bodyCache2) {
                  this.setModelMatrix(x, y, childWidth, childHeight, z);
                  gl.activeTexture(gl.TEXTURE0);
                  gl.bindTexture(gl.TEXTURE_2D, bodyCache2.texture);
                  gl.uniform1i(this.locations.u_UseTexture, 1);
                  gl.uniform1i(this.locations.u_Use9Slice, 1);
                  gl.uniform2f(
                    this.locations.u_Dimensions,
                    childWidth,
                    childHeight
                  );
                  gl.uniform2f(
                    this.locations.u_TextureSize,
                    bodyCache2.nativeWidth,
                    bodyCache2.nativeHeight
                  );
                  gl.uniform4f(
                    this.locations.u_SliceMargins,
                    16,
                    16,
                    16,
                    16
                  );
                  gl.uniform1i(this.locations.u_Sampler, 0);
                  gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
                  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }
                const headCache2 = this.textureCache.getTexture(
                  child.textureIds.head
                );
                if (headCache2) {
                  this.setModelMatrix(
                    x,
                    y,
                    childWidth,
                    NODE_LAYOUT.headerHeight,
                    z
                  );
                  gl.activeTexture(gl.TEXTURE0);
                  gl.bindTexture(gl.TEXTURE_2D, headCache2.texture);
                  gl.uniform1i(this.locations.u_UseTexture, 1);
                  gl.uniform1i(this.locations.u_Use9Slice, 1);
                  gl.uniform2f(
                    this.locations.u_Dimensions,
                    childWidth,
                    NODE_LAYOUT.headerHeight
                  );
                  gl.uniform2f(
                    this.locations.u_TextureSize,
                    headCache2.nativeWidth,
                    headCache2.nativeHeight
                  );
                  gl.uniform4f(
                    this.locations.u_SliceMargins,
                    16,
                    16,
                    16,
                    16
                  );
                  gl.uniform1i(this.locations.u_Sampler, 0);
                  gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
                  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }
                this.textRenderer.addText(
                  child.text,
                  x + 12,
                  y + NODE_LAYOUT.headerHeight / 2,
                  13,
                  r,
                  g,
                  b,
                  1,
                  "left",
                  "middle"
                );
                yOffset += childHeight + 10;
              }
              if (children.length > 5) {
                this.textRenderer.addText(
                  `+ ${children.length - 5} more nodes`,
                  worldX + padding,
                  worldY + yOffset,
                  12,
                  r,
                  g,
                  b,
                  0.5,
                  "left",
                  "top"
                );
              }
            }
          }
        } else if (node.nodeType === "node") {
          if (node.props) {
            let cursorY = worldY + NODE_LAYOUT.headerHeight + 16;
            const xLeft = worldX + NODE_LAYOUT.padding + 4;
            const xRight = worldX + node.width - NODE_LAYOUT.padding - 4;
            const boolU = node.props.booleans["ungrouped"];
            const textU = node.props.texts["ungrouped"];
            const enumU = node.props.enums["ungrouped"];
            if (boolU)
              for (let i = 0; i < boolU.length; i++) {
                const p = boolU[i];
                this.textRenderer.addText(
                  p.label,
                  xLeft + 4,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  0.9,
                  "left",
                  "middle"
                );
                this.iconRenderer.addText(
                  p.value ? "" : "",
                  xRight,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  1,
                  "right",
                  "middle"
                );
                cursorY += 20;
              }
            if (textU)
              for (let i = 0; i < textU.length; i++) {
                const p = textU[i];
                this.textRenderer.addText(
                  p.label,
                  xLeft + 4,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  0.9,
                  "left",
                  "middle"
                );
                this.textRenderer.addText(
                  String(p.value),
                  xRight,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  1,
                  "right",
                  "middle"
                );
                cursorY += 20;
              }
            if (enumU)
              for (let i = 0; i < enumU.length; i++) {
                const p = enumU[i];
                this.textRenderer.addText(
                  p.label,
                  xLeft + 4,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  0.9,
                  "left",
                  "middle"
                );
                this.textRenderer.addText(
                  String(p.value),
                  xRight,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  1,
                  "right",
                  "middle"
                );
                cursorY += 20;
              }
            const groups = node.props.groups;
            for (let gi = 0; gi < groups.length; gi++) {
              const groupName = groups[gi];
              const boolG = node.props.booleans[groupName];
              const textG = node.props.texts[groupName];
              const enumG = node.props.enums[groupName];
              const hasItems = boolG && boolG.length > 0 || textG && textG.length > 0 || enumG && enumG.length > 0;
              if (hasItems) {
                this.textRenderer.addText(
                  groupName.toUpperCase(),
                  xLeft,
                  cursorY,
                  10,
                  r,
                  g,
                  b,
                  0.5,
                  "left",
                  "middle"
                );
                cursorY += 20;
                const boolGCount = boolG == null ? void 0 : boolG.length;
                if (boolG)
                  for (let i = 0; i < boolGCount; i++) {
                    const groupBottomPadding = i === boolGCount - 1 && !(textG || enumG) ? 8 : 0;
                    const p = boolG[i];
                    this.textRenderer.addText(
                      p.label,
                      xLeft + 4,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1,
                      "left",
                      "middle"
                    );
                    this.iconRenderer.addText(
                      p.value ? "" : "",
                      xRight,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1,
                      "right",
                      "middle"
                    );
                    cursorY += 20 + groupBottomPadding;
                  }
                const textGCount = textG == null ? void 0 : textG.length;
                if (textG)
                  for (let i = 0; i < textGCount; i++) {
                    const groupBottomPadding = i === textGCount - 1 && !enumG ? 8 : 0;
                    const p = textG[i];
                    this.textRenderer.addText(
                      p.label,
                      xLeft + 4,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1,
                      "left",
                      "middle"
                    );
                    this.textRenderer.addText(
                      String(p.value),
                      xRight,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1,
                      "right",
                      "middle"
                    );
                    cursorY += 20 + groupBottomPadding;
                  }
                const enumGCount = enumG == null ? void 0 : enumG.length;
                if (enumG)
                  for (let i = 0; i < enumGCount; i++) {
                    const groupBottomPadding = i === enumGCount - 1 ? 8 : 0;
                    const p = enumG[i];
                    this.textRenderer.addText(
                      p.label,
                      xLeft + 4,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1,
                      "left",
                      "middle"
                    );
                    this.textRenderer.addText(
                      String(p.value),
                      xRight,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1,
                      "right",
                      "middle"
                    );
                    cursorY += 20 + groupBottomPadding;
                  }
              }
            }
          } else {
            this.textRenderer.addText(
              "Properties...",
              worldX + NODE_LAYOUT.padding,
              worldY + NODE_LAYOUT.headerHeight + NODE_LAYOUT.padding,
              12,
              r,
              g,
              b,
              1,
              "left",
              "top"
            );
          }
        }
      }
    }
  }
  getDrawAPI() {
    return {
      setModelMatrix: (x, y, w, h, z) => this.setModelMatrix(x, y, w, h, z),
      getTextureCache: () => this.textureCache,
      getLocations: () => this.locations,
      getCamera: () => this.camera,
      getGL: () => this.gl
    };
  }
  drawGenericRoundedRect(node, worldX, worldY, z, desc) {
    var _a2, _b, _c, _d;
    const gl = this.gl;
    const config = desc.renderConfig;
    const radius = (config == null ? void 0 : config.radius) ?? 12;
    const borderWidth = (config == null ? void 0 : config.borderWidth) ?? 1.5;
    const [fillR, fillG, fillB, fillA] = (config == null ? void 0 : config.fillColor) ?? [0.08, 0.09, 0.1, 0.9];
    const [borderR, borderG, borderB, borderA] = (config == null ? void 0 : config.borderColor) ?? [1, 1, 1, 0.9];
    const isCollapsed = this.store.shouldCollapseNode(node);
    if (node.isDropTarget || node.isSelected) {
      this.setModelMatrix(
        worldX - 3,
        worldY - 3,
        node.width + 6,
        node.height + 6,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 1);
      gl.uniform2f(this.locations.u_Dimensions, node.width + 6, node.height + 6);
      gl.uniform4f(
        this.locations.u_Color,
        node.isDropTarget ? 0.04 : 0.08,
        node.isDropTarget ? 0.38 : 0.14,
        node.isDropTarget ? 0.16 : 0.68,
        0.09
      );
      gl.uniform4f(this.locations.u_BorderColor, 0.9, 0.95, 1, 0.95);
      gl.uniform1f(this.locations.u_BorderWidth, 2);
      gl.uniform1f(this.locations.u_Radius, isCollapsed ? 8 : radius);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    this.setModelMatrix(worldX, worldY, node.width, node.height, z);
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 1);
    gl.uniform2f(this.locations.u_Dimensions, node.width, node.height);
    gl.uniform4f(this.locations.u_Color, fillR, fillG, fillB, isCollapsed ? 0.9 : fillA);
    gl.uniform4f(this.locations.u_BorderColor, borderR, borderG, borderB, borderA);
    gl.uniform1f(this.locations.u_BorderWidth, isCollapsed ? borderWidth : borderWidth);
    gl.uniform1f(this.locations.u_Radius, isCollapsed ? 8 : radius);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);
    if (node.nodeType === "hub") {
      const slotPadding = 10;
      const iconSlotWidth = Math.max(
        48,
        Math.min(Math.round(node.height * 0.62), Math.max(56, Math.round(node.width * 0.28)))
      );
      const iconSlotHeight = Math.max(0, node.height - slotPadding * 2);
      const iconCenterX = worldX + slotPadding + iconSlotWidth / 2;
      const iconCenterY = worldY + node.height / 2;
      this.setModelMatrix(
        worldX + slotPadding,
        worldY + slotPadding,
        iconSlotWidth,
        iconSlotHeight,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 1);
      gl.uniform2f(this.locations.u_Dimensions, iconSlotWidth, iconSlotHeight);
      gl.uniform4f(this.locations.u_Color, 0.15, 0.16, 0.18, 0.92);
      gl.uniform4f(this.locations.u_BorderColor, 1, 1, 1, 0.28);
      gl.uniform1f(this.locations.u_BorderWidth, 1);
      gl.uniform1f(this.locations.u_Radius, 12);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      this.iconRenderer.addText(
        "",
        iconCenterX,
        iconCenterY,
        Math.min(iconSlotWidth, iconSlotHeight) * 0.55,
        1,
        1,
        1,
        0.92,
        "center",
        "middle"
      );
    }
    const [r, g, b, _] = this.getFontColor();
    const overlayConfig = desc.overlayConfig;
    if (overlayConfig) {
      let titleY;
      if (isCollapsed) {
        titleY = node.height / 2;
      } else if (overlayConfig.titlePosition === "container-top") {
        titleY = 20;
      } else if (overlayConfig.titlePosition === "center") {
        titleY = node.height / 2;
      } else {
        titleY = NODE_LAYOUT.headerHeight / 2;
      }
      let titleX = worldX + NODE_LAYOUT.padding;
      if (node.nodeType === "hub") {
        const iconSlotWidth = Math.max(
          48,
          Math.min(Math.round(node.height * 0.62), Math.max(56, Math.round(node.width * 0.28)))
        );
        titleX = worldX + iconSlotWidth + NODE_LAYOUT.padding * 1.5;
        titleY = node.height / 2;
      }
      if (overlayConfig.showTitle || isCollapsed) {
        this.textRenderer.addText(
          node.text,
          titleX,
          worldY + titleY,
          14,
          r,
          g,
          b,
          1,
          "left",
          "middle"
        );
      }
      if (overlayConfig.showLockIcon) {
        const lockX = node.width / 2;
        const lockY = NODE_LAYOUT.lockBtnTopY;
        const isLocked = Boolean(node.isLocked);
        this.iconBackgroundRenderer.addQuad(
          worldX + lockX,
          worldY + lockY + 1.2,
          r,
          g,
          b,
          isLocked ? 0.12 : 0.05,
          dumbGlyphWidth,
          dumbGlyphHeight,
          ((_a2 = this.iconAtlas.common) == null ? void 0 : _a2.base) || 0,
          ((_b = this.iconAtlas.common) == null ? void 0 : _b.lineHeight) || 0,
          16,
          "center",
          void 0,
          "circle"
        );
        this.iconRenderer.addText(
          isLocked ? "" : "",
          worldX + lockX,
          worldY + lockY,
          16,
          r,
          g,
          b,
          1,
          "center",
          "middle"
        );
      }
      if (overlayConfig.showAddIcon && !isCollapsed) {
        const xPos = node.width / 2;
        const yPos = node.height - NODE_LAYOUT.plusBtnPaddingBottom;
        this.iconBackgroundRenderer.addQuad(
          worldX + xPos,
          worldY + yPos + 1.2,
          r,
          g,
          b,
          0.05,
          dumbGlyphWidth,
          dumbGlyphHeight,
          ((_c = this.iconAtlas.common) == null ? void 0 : _c.base) || 0,
          ((_d = this.iconAtlas.common) == null ? void 0 : _d.lineHeight) || 0,
          16,
          "center",
          void 0,
          "circle"
        );
        this.textRenderer.addText(
          "+",
          worldX + xPos,
          worldY + yPos,
          20,
          r,
          g,
          b,
          1,
          "center",
          "middle"
        );
      }
    }
    if (desc.drawOverlay) {
      desc.drawOverlay({
        node,
        worldX,
        worldY,
        z,
        isCollapsed,
        textRenderer: this.textRenderer,
        iconRenderer: this.iconRenderer,
        iconBackgroundRenderer: this.iconBackgroundRenderer,
        fontColor: [r, g, b]
      });
    }
  }
  drawBranchNode(node, worldX, worldY, z, picking, desc) {
    const gl = this.gl;
    const config = desc == null ? void 0 : desc.renderConfig;
    const radius = (config == null ? void 0 : config.radius) ?? 10;
    const borderWidth = (config == null ? void 0 : config.borderWidth) ?? 1.8;
    const [fillR, fillG, fillB, fillA] = (config == null ? void 0 : config.fillColor) ?? [0.1, 0.11, 0.13, 0.95];
    const [borderR, borderG, borderB, borderA] = (config == null ? void 0 : config.borderColor) ?? [0.45, 0.5, 0.58, 0.9];
    if (picking) {
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 2);
      gl.uniform2f(this.locations.u_Dimensions, node.width, node.height);
      gl.uniform4f(
        this.locations.u_Color,
        node.pickColor[0],
        node.pickColor[1],
        node.pickColor[2],
        1
      );
      gl.uniform4f(this.locations.u_BorderColor, node.pickColor[0], node.pickColor[1], node.pickColor[2], 1);
      gl.uniform1f(this.locations.u_BorderWidth, 0);
      gl.uniform1f(this.locations.u_Radius, radius);
      this.setModelMatrix(worldX, worldY, node.width, node.height, z);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      return;
    }
    const [r, g, b, _] = this.getFontColor();
    if (node.isDropTarget || node.isSelected) {
      this.setModelMatrix(
        worldX - 4,
        worldY - 4,
        node.width + 8,
        node.height + 8,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 2);
      gl.uniform2f(this.locations.u_Dimensions, node.width + 8, node.height + 8);
      gl.uniform4f(
        this.locations.u_Color,
        node.isDropTarget ? 0.04 : 0.08,
        node.isDropTarget ? 0.38 : 0.14,
        node.isDropTarget ? 0.16 : 0.68,
        0.09
      );
      gl.uniform4f(this.locations.u_BorderColor, 0.9, 0.95, 1, 0.95);
      gl.uniform1f(this.locations.u_BorderWidth, 2.5);
      gl.uniform1f(this.locations.u_Radius, radius);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    this.setModelMatrix(worldX, worldY, node.width, node.height, z);
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 2);
    gl.uniform2f(this.locations.u_Dimensions, node.width, node.height);
    gl.uniform4f(this.locations.u_Color, fillR, fillG, fillB, fillA);
    gl.uniform4f(this.locations.u_BorderColor, borderR, borderG, borderB, borderA);
    gl.uniform1f(this.locations.u_BorderWidth, borderWidth);
    gl.uniform1f(this.locations.u_Radius, radius);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);
    const iconCenterX = worldX + node.width / 2;
    const iconCenterY = worldY + node.height * 0.45;
    const iconSize = Math.min(node.width, node.height) * 0.22;
    this.iconRenderer.addText(
      "",
      iconCenterX,
      iconCenterY,
      iconSize,
      1,
      1,
      1,
      0.85,
      "center",
      "middle"
    );
    const titleY = worldY + node.height * 0.68;
    this.textRenderer.addText(
      node.text,
      worldX + node.width / 2,
      titleY,
      12,
      r,
      g,
      b,
      1,
      "center",
      "middle"
    );
  }
  drawSubgraphNode(node, worldX, worldY, z) {
    const gl = this.gl;
    const [r, g, b, _] = this.getFontColor();
    const collapsed = Boolean(node.isCollapsed);
    if (node.isDropTarget || node.isSelected) {
      this.setModelMatrix(
        worldX - 3,
        worldY - 3,
        node.width + 6,
        node.height + 6,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 1);
      gl.uniform2f(this.locations.u_Dimensions, node.width + 6, node.height + 6);
      gl.uniform4f(
        this.locations.u_Color,
        node.isDropTarget ? 0.04 : 0.08,
        node.isDropTarget ? 0.38 : 0.14,
        node.isDropTarget ? 0.16 : 0.68,
        0.09
      );
      gl.uniform4f(this.locations.u_BorderColor, 0.9, 0.95, 1, 0.95);
      gl.uniform1f(this.locations.u_BorderWidth, 2);
      gl.uniform1f(this.locations.u_Radius, collapsed ? 8 : 12);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    this.setModelMatrix(worldX, worldY, node.width, node.height, z);
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 1);
    gl.uniform2f(this.locations.u_Dimensions, node.width, node.height);
    gl.uniform4f(this.locations.u_Color, 0.08, 0.09, 0.1, collapsed ? 0.9 : 0.22);
    gl.uniform4f(this.locations.u_BorderColor, 1, 1, 1, 0.9);
    gl.uniform1f(this.locations.u_BorderWidth, collapsed ? 1.5 : 2);
    gl.uniform1f(this.locations.u_Radius, collapsed ? 8 : 12);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);
    const titleY = collapsed ? node.height / 2 : 20;
    this.textRenderer.addText(
      node.text,
      worldX + NODE_LAYOUT.padding,
      worldY + titleY,
      14,
      r,
      g,
      b,
      1,
      "left",
      "middle"
    );
  }
  drawHubNode(node, worldX, worldY, z, picking) {
    const gl = this.gl;
    if (picking) {
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform4f(
        this.locations.u_Color,
        node.pickColor[0],
        node.pickColor[1],
        node.pickColor[2],
        1
      );
      this.setModelMatrix(worldX, worldY, node.width, node.height, z);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      return;
    }
    const [r, g, b, _] = this.getFontColor();
    const slotPadding = 10;
    const iconSlotWidth = Math.max(
      48,
      Math.min(Math.round(node.height * 0.62), Math.max(56, Math.round(node.width * 0.28)))
    );
    const iconSlotHeight = Math.max(0, node.height - slotPadding * 2);
    const iconCenterX = worldX + slotPadding + iconSlotWidth / 2;
    const iconCenterY = worldY + node.height / 2;
    const labelX = worldX + iconSlotWidth + NODE_LAYOUT.padding * 1.5;
    const titleY = node.height / 2;
    if (node.isDropTarget || node.isSelected) {
      this.setModelMatrix(
        worldX - 3,
        worldY - 3,
        node.width + 6,
        node.height + 6,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 1);
      gl.uniform2f(this.locations.u_Dimensions, node.width + 6, node.height + 6);
      gl.uniform4f(
        this.locations.u_Color,
        node.isDropTarget ? 0.04 : 0.08,
        node.isDropTarget ? 0.38 : 0.14,
        node.isDropTarget ? 0.16 : 0.68,
        0.09
      );
      gl.uniform4f(this.locations.u_BorderColor, 0.9, 0.95, 1, 0.95);
      gl.uniform1f(this.locations.u_BorderWidth, 2);
      gl.uniform1f(this.locations.u_Radius, 16);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    this.setModelMatrix(worldX, worldY, node.width, node.height, z);
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 1);
    gl.uniform2f(this.locations.u_Dimensions, node.width, node.height);
    gl.uniform4f(this.locations.u_Color, 0.08, 0.09, 0.1, 0.92);
    gl.uniform4f(this.locations.u_BorderColor, 1, 1, 1, 0.9);
    gl.uniform1f(this.locations.u_BorderWidth, 2);
    gl.uniform1f(this.locations.u_Radius, 16);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);
    this.setModelMatrix(
      worldX + slotPadding,
      worldY + slotPadding,
      iconSlotWidth,
      iconSlotHeight,
      z
    );
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 1);
    gl.uniform2f(this.locations.u_Dimensions, iconSlotWidth, iconSlotHeight);
    gl.uniform4f(this.locations.u_Color, 0.15, 0.16, 0.18, 0.92);
    gl.uniform4f(this.locations.u_BorderColor, 1, 1, 1, 0.28);
    gl.uniform1f(this.locations.u_BorderWidth, 1);
    gl.uniform1f(this.locations.u_Radius, 12);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);
    this.iconRenderer.addText(
      "",
      iconCenterX,
      iconCenterY,
      Math.max(18, Math.min(28, iconSlotHeight * 0.48)),
      1,
      1,
      1,
      1,
      "center",
      "middle"
    );
    this.textRenderer.addText(
      node.text,
      labelX,
      worldY + titleY,
      14,
      r,
      g,
      b,
      1,
      "left",
      "middle"
    );
  }
  setModelMatrix(x, y, w, h, z = 0) {
    this.modelMatrix.setIdentity();
    this.modelMatrix.translate(x, y, z);
    this.modelMatrix.scale(w, h, 1);
    this.gl.uniformMatrix4fv(
      this.locations.u_ModelMatrix,
      false,
      this.modelMatrix.elements
    );
    this.gl.disableVertexAttribArray(this.locations.a_Z);
    this.gl.vertexAttrib1f(this.locations.a_Z, z);
  }
}
class UIControls {
  constructor(canvas, container, historyPane, toolPane, callbacks) {
    __publicField(this, "addNodeButton");
    __publicField(this, "addBranchButton");
    __publicField(this, "createSubgraphButton");
    __publicField(this, "addGroupButton");
    __publicField(this, "addCompositionButton");
    __publicField(this, "multiSelectButton");
    __publicField(this, "undoButton");
    __publicField(this, "redoButton");
    __publicField(this, "deleteNodeButton");
    __publicField(this, "sidebar");
    __publicField(this, "sidebarToggle");
    __publicField(this, "nodeProperties");
    __publicField(this, "nodeLabelInput");
    __publicField(this, "nodePropGroup");
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    this.sidebar = container;
    this.addNodeButton = (_a2 = toolPane.shadowRoot) == null ? void 0 : _a2.querySelector(
      "#btn-add-node"
    );
    this.addGroupButton = (_b = toolPane.shadowRoot) == null ? void 0 : _b.querySelector(
      "#btn-add-group"
    );
    this.addCompositionButton = (_c = toolPane.shadowRoot) == null ? void 0 : _c.querySelector(
      "#btn-add-composition"
    );
    this.multiSelectButton = (_d = toolPane.shadowRoot) == null ? void 0 : _d.querySelector(
      "#btn-multi-select"
    );
    this.createSubgraphButton = (_e = toolPane.shadowRoot) == null ? void 0 : _e.querySelector(
      "#btn-create-subgraph"
    );
    this.addBranchButton = (_f = toolPane.shadowRoot) == null ? void 0 : _f.querySelector(
      "#btn-add-branch"
    );
    this.undoButton = (_g = historyPane.shadowRoot) == null ? void 0 : _g.querySelector(
      "#btn-undo"
    );
    this.redoButton = (_h = historyPane.shadowRoot) == null ? void 0 : _h.querySelector(
      "#btn-redo"
    );
    this.deleteNodeButton = (_i = toolPane.shadowRoot) == null ? void 0 : _i.querySelector(
      "#btn-delete-node"
    );
    this.sidebarToggle = (_j = container.shadowRoot) == null ? void 0 : _j.querySelector(
      "#sidebar-toggle"
    );
    this.nodeProperties = (_k = container.shadowRoot) == null ? void 0 : _k.querySelector(
      "#node-properties"
    );
    this.nodeLabelInput = (_l = container.shadowRoot) == null ? void 0 : _l.querySelector(
      "#node-label-input"
    );
    this.nodePropGroup = (_m = container.shadowRoot) == null ? void 0 : _m.querySelector(
      "#node-prop-group"
    );
    this.addNodeButton.addEventListener("click", () => callbacks.onAddNode());
    this.addGroupButton.addEventListener("click", () => callbacks.onAddGroup());
    this.addCompositionButton.addEventListener(
      "click",
      () => callbacks.onAddComposition()
    );
    this.multiSelectButton.addEventListener(
      "click",
      () => callbacks.onToggleMultiSelect()
    );
    this.createSubgraphButton.addEventListener(
      "click",
      () => callbacks.onSubgraphCreate()
    );
    (_n = this.addBranchButton) == null ? void 0 : _n.addEventListener(
      "click",
      () => {
        var _a3;
        return (_a3 = callbacks.onAddBranch) == null ? void 0 : _a3.call(callbacks);
      }
    );
    this.undoButton.addEventListener("click", () => callbacks.onUndo());
    this.redoButton.addEventListener("click", () => callbacks.onRedo());
    this.deleteNodeButton.addEventListener(
      "click",
      () => callbacks.onDeleteNode()
    );
    const kebabMenu = document.getElementById("kebab-menu");
    kebabMenu == null ? void 0 : kebabMenu.addEventListener("gg-kebab-action", (e) => {
      var _a3, _b2;
      const customEvent = e;
      if (customEvent.detail.action === "import") {
        (_a3 = callbacks.onImport) == null ? void 0 : _a3.call(callbacks);
      } else if (customEvent.detail.action === "export") {
        (_b2 = callbacks.onExport) == null ? void 0 : _b2.call(callbacks);
      }
    });
    const bgPicker = (_o = container.shadowRoot) == null ? void 0 : _o.querySelector(
      "#bg-color-picker"
    );
    bgPicker == null ? void 0 : bgPicker.addEventListener("input", (e) => {
      const hex = e.target.value;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      callbacks.onBgColorChange(r, g, b, 1);
    });
    const fontColorPicker = (_p = container.shadowRoot) == null ? void 0 : _p.querySelector(
      "#font-color-picker"
    );
    fontColorPicker == null ? void 0 : fontColorPicker.addEventListener("input", (e) => {
      const hex = e.target.value;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      callbacks.onFontColorChange(r, g, b, 1);
    });
    const themeSelect = (_q = container.shadowRoot) == null ? void 0 : _q.querySelector(
      "#theme-selector"
    );
    themeSelect == null ? void 0 : themeSelect.addEventListener("gg-select-change", (e) => {
      callbacks.onThemeChange(
        e.target.value
      );
    });
    const textureSelect = (_r = container.shadowRoot) == null ? void 0 : _r.querySelector(
      "#texture-selector"
    );
    textureSelect == null ? void 0 : textureSelect.refresh();
    container.addEventListener("gg-texture-select-change", (e) => {
      const customEvent = e;
      callbacks.onGlobalTextureChange(
        customEvent.detail.kind,
        customEvent.detail.value
      );
    });
    this.sidebarToggle.addEventListener("click", () => {
      this.sidebar.classList.toggle("collapsed");
    });
    this.nodeLabelInput.addEventListener("input", (e) => {
      callbacks.onLabelChange(e.target.value);
    });
    this.nodeLabelInput.addEventListener(
      "blur",
      () => callbacks.onLabelCommit()
    );
    this.nodeLabelInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.nodeLabelInput.blur();
      }
    });
    canvas.addEventListener("pointerdown", (e) => callbacks.onPointerDown(e));
    window.addEventListener("pointermove", (e) => callbacks.onPointerMove(e));
    window.addEventListener("pointerup", (e) => callbacks.onPointerUp(e));
    window.addEventListener(
      "pointercancel",
      (e) => callbacks.onPointerCancel(e)
    );
    canvas.addEventListener("wheel", (e) => callbacks.onWheel(e), {
      passive: false
    });
  }
  enableDelete() {
    this.deleteNodeButton.disabled = false;
  }
  disableDelete() {
    this.deleteNodeButton.disabled = true;
  }
  enableAddComposition() {
    this.addCompositionButton.disabled = false;
  }
  disableAddComposition() {
    this.addCompositionButton.disabled = true;
  }
  setMultiSelectActive(active) {
    this.multiSelectButton.classList.toggle("active", active);
    if (this.multiSelectButton.classList.contains("active"))
      this.createSubgraphButton.disabled = false;
    else this.createSubgraphButton.disabled = true;
  }
  enableUndo() {
    this.undoButton.disabled = false;
  }
  disableUndo() {
    this.undoButton.disabled = true;
  }
  enableRedo() {
    this.redoButton.disabled = false;
  }
  disableRedo() {
    this.redoButton.disabled = true;
  }
  showProperties(node) {
    this.nodeProperties.style.display = "flex";
    this.nodeLabelInput.value = node.text;
    if (node.props) {
      this.nodePropGroup.useProps(node.props);
      this.nodePropGroup.style.display = "block";
    } else {
      this.nodePropGroup.style.display = "none";
    }
    this.sidebar.classList.remove("collapsed");
  }
  hideProperties() {
    this.nodeProperties.style.display = "none";
  }
}
class HistoryStack {
  constructor(options = {}) {
    __publicField(this, "undoStack", []);
    __publicField(this, "redoStack", []);
    __publicField(this, "maxHistory");
    this.maxHistory = Math.max(1, options.maxHistory ?? 100);
  }
  push(command) {
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.splice(0, this.undoStack.length - this.maxHistory);
    }
    this.redoStack = [];
  }
  get undoDepth() {
    return this.undoStack.length;
  }
  get redoDepth() {
    return this.redoStack.length;
  }
  canUndo() {
    return this.undoStack.length > 0;
  }
  canRedo() {
    return this.redoStack.length > 0;
  }
  /** Discard all undo/redo history. Used when importing a graph. */
  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
  undo(ctx) {
    const command = this.undoStack.pop();
    if (!command) return null;
    command.undo(ctx);
    this.redoStack.push(command);
    return command;
  }
  redo(ctx) {
    const command = this.redoStack.pop();
    if (!command) return null;
    command.redo(ctx);
    this.undoStack.push(command);
    return command;
  }
}
function clonePrimitiveList(entries) {
  return (entries == null ? void 0 : entries.map((entry) => ({ ...entry }))) ?? [];
}
function clonePrimitiveGroups(groups) {
  const cloned = {};
  for (const [group, entries] of Object.entries(groups)) {
    cloned[group] = clonePrimitiveList(entries);
  }
  return cloned;
}
function cloneNodeProps(props) {
  if (!props) return void 0;
  return {
    groups: [...props.groups],
    booleans: clonePrimitiveGroups(props.booleans),
    texts: clonePrimitiveGroups(props.texts),
    enums: clonePrimitiveGroups(props.enums)
  };
}
function captureNodeHistorySnapshot(node) {
  return {
    id: node.id,
    nodeType: node.nodeType,
    localX: node.localX,
    localY: node.localY,
    width: node.width,
    height: node.height,
    text: node.text,
    textureIds: { ...node.textureIds },
    visible: node.visible,
    isSelected: node.isSelected,
    isDropTarget: Boolean(node.isDropTarget),
    isLocked: Boolean(node.isLocked),
    isCollapsed: Boolean(node.isCollapsed),
    parentId: node.parentId,
    childIds: [...node.childIds],
    compositionRefId: node.compositionRefId,
    props: cloneNodeProps(node.props),
    handleStates: node.handles.map((handle) => ({
      side: handle.side,
      isConnected: handle.isConnected
    }))
  };
}
class UpdatePropCommand {
  constructor(payload) {
    __publicField(this, "type", "update-prop");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncPropertiesPanel();
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.applyNodeSnapshot(this.payload.afterSnapshot);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncPropertiesPanel();
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncToolbarState();
  }
}
class UpdateLabelCommand {
  constructor(payload) {
    __publicField(this, "type", "update-label");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.store.updateLabel(
      this.payload.nodeId,
      this.payload.previousLabel,
      ctx.theme
    );
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.store.updateLabel(
      this.payload.nodeId,
      this.payload.nextLabel,
      ctx.theme
    );
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}
class DeleteNodeCommand {
  constructor(payload) {
    __publicField(this, "type", "delete-node");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.restoreNodeSnapshots(this.payload.nodeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.edgeSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.removeNodeAndIncidentEdges(this.payload.nodeId);
    ctx.clearSelectionState();
    ctx.syncPropertiesPanel();
    if (this.payload.parentId !== null) {
      ctx.refreshContainerChain(this.payload.parentId);
    }
    ctx.syncToolbarState();
  }
}
class DeleteEdgeCommand {
  constructor(payload) {
    __publicField(this, "type", "delete-edge");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.restoreEdgeSnapshots([this.payload.edgeSnapshot]);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }
  redo(ctx) {
    const removed = ctx.edgeStore.remove(this.payload.edgeSnapshot.id);
    if (removed) {
      ctx.clearCompositionReferenceForEdge(removed);
      ctx.syncHandleStates(removed.sourceNodeId);
      ctx.syncHandleStates(removed.targetNodeId);
    }
    ctx.clearSelectionState();
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}
class DeleteSelectionCommand {
  constructor(payload) {
    __publicField(this, "type", "delete-selection");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.restoreNodeSnapshots(this.payload.nodeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.edgeSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    for (const parentId of this.payload.parentIds) {
      ctx.refreshContainerChain(parentId);
    }
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.removeNodesAndEdges(
      this.payload.removedNodeIds,
      this.payload.removedEdgeIds
    );
    ctx.clearSelectionState();
    ctx.syncPropertiesPanel();
    for (const parentId of this.payload.parentIds) {
      ctx.refreshContainerChain(parentId);
    }
    ctx.syncToolbarState();
  }
}
class CreateNodeCommand {
  constructor(payload) {
    __publicField(this, "type", "create-node");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.removeNodeAndIncidentEdges(this.payload.snapshot.id);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.applyNodeSnapshot(this.payload.snapshot);
    ctx.refreshContainerChain(this.payload.parentId);
    if (this.payload.selectOnRedo) {
      ctx.clearSelectionState();
      ctx.setNodeSelected(this.payload.snapshot.id, true);
    } else {
      ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    }
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}
class CreateHubFromConnectionDropCommand {
  constructor(payload) {
    __publicField(this, "type", "create-hub-from-connection-drop");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.removeNodesAndEdges([this.payload.hubSnapshot.id], [this.payload.edgeSnapshot.id]);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.applyNodeSnapshot(this.payload.hubSnapshot);
    ctx.restoreEdgeSnapshots([this.payload.edgeSnapshot]);
    ctx.clearSelectionState();
    ctx.setNodeSelected(this.payload.hubSnapshot.id, true);
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}
class ConnectCommand {
  constructor(payload) {
    __publicField(this, "type", "connect");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    const removed = ctx.edgeStore.remove(this.payload.edgeSnapshot.id);
    if (removed) {
      ctx.clearCompositionReferenceForEdge(removed);
      ctx.syncHandleStates(removed.sourceNodeId);
      ctx.syncHandleStates(removed.targetNodeId);
    }
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.restoreEdgeSnapshots([this.payload.edgeSnapshot]);
    ctx.syncToolbarState();
  }
}
class ToggleLockCommand {
  constructor(payload) {
    __publicField(this, "type", "toggle-lock");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
  }
  redo(ctx) {
    ctx.applyNodeSnapshot(this.payload.afterSnapshot);
  }
}
class ToggleSubgraphCollapseCommand {
  constructor(payload) {
    __publicField(this, "type", "toggle-subgraph-collapse");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
    ctx.refreshContainerChain(this.payload.beforeSnapshot.id);
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.applyNodeSnapshot(this.payload.afterSnapshot);
    ctx.refreshContainerChain(this.payload.afterSnapshot.id);
    ctx.syncToolbarState();
  }
}
class CreateSubgraphCommand {
  constructor(payload) {
    __publicField(this, "type", "create-subgraph");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.removeContainerOnly(this.payload.subgraphSnapshot.id);
    ctx.restoreNodeSnapshots(this.payload.childBeforeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.removedEdgeSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.subgraphSnapshot.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.applyNodeSnapshot(this.payload.subgraphSnapshot);
    ctx.restoreNodeSnapshots(this.payload.childAfterSnapshots);
    for (const edge of this.payload.removedEdgeSnapshots) {
      const removed = ctx.edgeStore.remove(edge.id);
      if (removed) {
        ctx.syncHandleStates(removed.sourceNodeId);
        ctx.syncHandleStates(removed.targetNodeId);
      }
    }
    ctx.clearSelectionState();
    ctx.setNodeSelected(this.payload.subgraphSnapshot.id, true);
    ctx.refreshContainerChain(this.payload.subgraphSnapshot.id);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}
class UngraphCommand {
  constructor(payload) {
    __publicField(this, "type", "ungraph");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.applyNodeSnapshot(this.payload.subgraphSnapshot);
    ctx.restoreNodeSnapshots(this.payload.childBeforeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.removedEdgeSnapshots);
    ctx.clearSelectionState();
    ctx.setNodeSelected(this.payload.subgraphSnapshot.id, true);
    ctx.refreshContainerChain(this.payload.subgraphSnapshot.id);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.removeContainerOnly(this.payload.subgraphSnapshot.id);
    for (const edge of this.payload.removedEdgeSnapshots) {
      const removed = ctx.edgeStore.remove(edge.id);
      if (removed) {
        ctx.syncHandleStates(removed.sourceNodeId);
        ctx.syncHandleStates(removed.targetNodeId);
      }
    }
    ctx.restoreNodeSnapshots(this.payload.childAfterSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.subgraphSnapshot.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}
class MoveSelectionCommand {
  constructor(payload) {
    __publicField(this, "type", "move-selection");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    for (const snapshot of this.payload.cloneSnapshots) {
      ctx.removeNodeAndIncidentEdges(snapshot.id);
    }
    ctx.restoreNodeSnapshots(this.payload.beforeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.removedReferenceEdgeSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    for (const parentId of this.payload.affectedParentIds) {
      ctx.refreshContainerChain(parentId);
    }
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.restoreNodeSnapshots(this.payload.afterSnapshots);
    for (const snapshot of this.payload.removedReferenceEdgeSnapshots) {
      const removed = ctx.edgeStore.remove(snapshot.id);
      if (removed) {
        ctx.clearCompositionReferenceForEdge(removed);
        ctx.syncHandleStates(removed.sourceNodeId);
        ctx.syncHandleStates(removed.targetNodeId);
      }
    }
    for (const snapshot of this.payload.cloneSnapshots) {
      ctx.restoreNodeSnapshots([snapshot]);
    }
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    for (const parentId of this.payload.affectedParentIds) {
      ctx.refreshContainerChain(parentId);
    }
    ctx.syncToolbarState();
  }
}
class DuplicateIntoCompositionCommand {
  constructor(payload) {
    __publicField(this, "type", "duplicate-into-composition");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.removeNodeAndIncidentEdges(this.payload.cloneSnapshot.id);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.compositionId);
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.store.restoreNodePlacement(
      this.payload.sourceId,
      this.payload.sourcePlacement.localX,
      this.payload.sourcePlacement.localY,
      this.payload.sourcePlacement.parentId
    );
    ctx.applyNodeSnapshot(this.payload.cloneSnapshot);
    ctx.clearSelectionState();
    ctx.setNodeSelected(this.payload.cloneSnapshot.id, true);
    ctx.refreshContainerChain(this.payload.compositionId);
    ctx.syncToolbarState();
  }
}
class ReparentCommand {
  constructor(payload) {
    __publicField(this, "type", "reparent");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.store.restoreNodePlacement(
      this.payload.nodeId,
      this.payload.beforePlacement.localX,
      this.payload.beforePlacement.localY,
      this.payload.beforePlacement.parentId
    );
    if (this.payload.removedReferenceEdgeSnapshots.length > 0) {
      ctx.restoreEdgeSnapshots(this.payload.removedReferenceEdgeSnapshots);
    }
    ctx.refreshContainerChain(this.payload.afterPlacement.parentId);
    ctx.refreshContainerChain(this.payload.beforePlacement.parentId);
    for (const id of this.payload.extraRefreshIds) {
      ctx.refreshContainerChain(id);
    }
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.store.restoreNodePlacement(
      this.payload.nodeId,
      this.payload.afterPlacement.localX,
      this.payload.afterPlacement.localY,
      this.payload.afterPlacement.parentId
    );
    for (const edgeSnapshot of this.payload.removedReferenceEdgeSnapshots) {
      const removed = ctx.edgeStore.remove(edgeSnapshot.id);
      if (removed) {
        ctx.clearCompositionReferenceForEdge(removed);
        ctx.syncHandleStates(removed.sourceNodeId);
        ctx.syncHandleStates(removed.targetNodeId);
      }
    }
    ctx.refreshContainerChain(this.payload.beforePlacement.parentId);
    ctx.refreshContainerChain(this.payload.afterPlacement.parentId);
    for (const id of this.payload.extraRefreshIds) {
      ctx.refreshContainerChain(id);
    }
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }
}
class MoveNodeCommand {
  constructor(payload) {
    __publicField(this, "type", "move-node");
    __publicField(this, "payload");
    this.payload = payload;
  }
  undo(ctx) {
    ctx.store.restoreNodePlacement(
      this.payload.nodeId,
      this.payload.beforePlacement.localX,
      this.payload.beforePlacement.localY,
      this.payload.beforePlacement.parentId
    );
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }
  redo(ctx) {
    ctx.store.restoreNodePlacement(
      this.payload.nodeId,
      this.payload.afterPlacement.localX,
      this.payload.afterPlacement.localY,
      this.payload.afterPlacement.parentId
    );
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }
}
class GraphEventEmitter {
  constructor() {
    __publicField(this, "debug", null);
    __publicField(this, "syncHandlers", /* @__PURE__ */ new Map());
    __publicField(this, "asyncHandlers", /* @__PURE__ */ new Map());
  }
  /**
   * Listen to a standard synchronous event.
   * Returns an unsubscribe function.
   */
  on(event, handler) {
    if (!this.syncHandlers.has(event)) {
      this.syncHandlers.set(event, /* @__PURE__ */ new Set());
    }
    this.syncHandlers.get(event).add(handler);
    return () => this.off(event, handler);
  }
  /**
   * Remove a synchronous event listener.
   */
  off(event, handler) {
    var _a2;
    (_a2 = this.syncHandlers.get(event)) == null ? void 0 : _a2.delete(handler);
  }
  /**
   * Dispatch a standard synchronous event.
   */
  dispatch(event, payload) {
    if (this.debug) {
      console.log(`[GraphEventEmitter] dispatch: ${event}`, payload);
    }
    const handlers = this.syncHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (e) {
          console.error(`Error in event handler for ${event}:`, e);
        }
      }
    }
  }
  /**
   * Listen to an async hook that can block execution.
   * Returns an unsubscribe function.
   */
  onBefore(event, handler) {
    if (!this.asyncHandlers.has(event)) {
      this.asyncHandlers.set(event, /* @__PURE__ */ new Set());
    }
    this.asyncHandlers.get(event).add(handler);
    return () => this.offBefore(event, handler);
  }
  /**
   * Remove an async hook listener.
   */
  offBefore(event, handler) {
    var _a2;
    (_a2 = this.asyncHandlers.get(event)) == null ? void 0 : _a2.delete(handler);
  }
  /**
   * Dispatch an async hook. 
   * Returns true if all listeners resolve to true (or truthy).
   * Returns false if ANY listener returns false or throws.
   */
  async dispatchBefore(event, payload) {
    if (this.debug) {
      console.log(`[GraphEventEmitter] dispatchBefore: ${event}`, payload);
    }
    const handlers = this.asyncHandlers.get(event);
    if (!handlers || handlers.size === 0) return true;
    for (const handler of handlers) {
      try {
        const allowed = await handler(payload);
        if (allowed === false) return false;
      } catch (e) {
        console.error(`Action blocked by exception in before-hook for ${event}:`, e);
        return false;
      }
    }
    return true;
  }
}
class NodeTypeRegistry {
  constructor() {
    __publicField(this, "descriptors", /* @__PURE__ */ new Map());
    __publicField(this, "containerTypes", /* @__PURE__ */ new Set());
    __publicField(this, "leafTypes", /* @__PURE__ */ new Set());
  }
  register(descriptor) {
    if (this.descriptors.has(descriptor.type)) {
      throw new Error(
        `NodeTypeRegistry: type "${descriptor.type}" is already registered`
      );
    }
    this.descriptors.set(descriptor.type, descriptor);
    if (descriptor.category === "container") {
      this.containerTypes.add(descriptor.type);
    } else {
      this.leafTypes.add(descriptor.type);
    }
  }
  get(type) {
    return this.descriptors.get(type);
  }
  has(type) {
    return this.descriptors.has(type);
  }
  getAll() {
    return this.descriptors.values();
  }
  isContainer(type) {
    return this.containerTypes.has(type);
  }
  isLeaf(type) {
    return this.leafTypes.has(type);
  }
  getZTier(type) {
    var _a2;
    return ((_a2 = this.descriptors.get(type)) == null ? void 0 : _a2.zTier) ?? 0.4;
  }
  getDefaultSize(type, collapsed) {
    const desc = this.descriptors.get(type);
    if (!desc) return { width: 190, height: 150 };
    if (collapsed && desc.collapsedSize) return { ...desc.collapsedSize };
    return { ...desc.defaultSize };
  }
  canReparentTo(childType, parentType) {
    const desc = this.descriptors.get(childType);
    if (!desc) return false;
    if (parentType === null) {
      return desc.canBeRoot;
    }
    if (!this.isContainer(parentType)) return false;
    if (desc.allowedParents === null) {
      return true;
    }
    return desc.allowedParents.includes(parentType);
  }
  isConnectionCandidate(type, connectionMode) {
    const desc = this.descriptors.get(type);
    if (!desc) return false;
    return desc.isConnectionCandidate(connectionMode);
  }
  hasHandles(type, connectionMode) {
    const desc = this.descriptors.get(type);
    if (!desc) return false;
    if (desc.handles.always) return true;
    return desc.isConnectionCandidate(connectionMode);
  }
  allowsMultiConnect(type) {
    var _a2;
    return ((_a2 = this.descriptors.get(type)) == null ? void 0 : _a2.handles.multiConnect) ?? false;
  }
  isValidConnectionSide(type, side, role) {
    const desc = this.descriptors.get(type);
    if (!desc) return true;
    if (role === "source") {
      return desc.handles.outputSides ? desc.handles.outputSides.includes(side) : true;
    }
    return desc.handles.inputSides ? desc.handles.inputSides.includes(side) : true;
  }
  getToolbarActions(type, isCollapsed) {
    const desc = this.descriptors.get(type);
    if (!desc) return [];
    if (isCollapsed && desc.collapsedToolbarActions) return desc.collapsedToolbarActions;
    return desc.toolbarActions ?? [];
  }
  contributesToChildWorldPosition(type) {
    const desc = this.descriptors.get(type);
    if (!desc) return true;
    return desc.contributesToChildWorldPosition ?? true;
  }
}
function createDefaultProps() {
  return {
    groups: ["Appearance", "Data", "Meta"],
    booleans: {
      "ungrouped": [
        { label: "Visible", value: true, uiPrimitive: "checkbox" },
        { label: "Primary", value: false, uiPrimitive: "checkbox" }
      ],
      "Appearance": [{ label: "Shadow", value: true, uiPrimitive: "checkbox" }]
    },
    texts: {
      "Data": [
        { label: "Value", value: "0", uiPrimitive: "range" },
        { label: "default", value: "0", uiPrimitive: "range" }
      ]
    },
    enums: {
      "Appearance": [
        { label: "Size", value: "Medium", uiPrimitive: "select", options: ["Medium", "Large", "ExtraLarge"] }
      ],
      "Meta": [
        { label: "Depth", value: "Deep", uiPrimitive: "select", options: ["Shallow", "Steep", "Deep"] }
      ]
    }
  };
}
const nodeDescriptor = {
  type: "node",
  category: "leaf",
  zTier: 0.4,
  defaultSize: { width: 190, height: 150 },
  collapsedSize: { width: 190, height: NODE_LAYOUT.headerHeight },
  handles: { always: true, sides: ["left", "right"], multiConnect: false },
  isConnectionCandidate: () => true,
  allowedParents: ["group", "subgraph"],
  canBeRoot: true,
  defaultTextureIds: { body: "gg-node-body-default", head: "gg-node-head-default" },
  textureKinds: ["node-body", "node-head"],
  createDefaultProps,
  calculateHeight: (node) => {
    if (!node.props) return 150;
    let lineCount = 0;
    for (const items of Object.values(node.props.booleans)) lineCount += items.length;
    for (const items of Object.values(node.props.texts)) lineCount += items.length;
    for (const items of Object.values(node.props.enums)) lineCount += items.length;
    lineCount += node.props.groups.length;
    return NODE_LAYOUT.headerHeight + 16 + lineCount * 20 + 16;
  },
  renderMode: "textured",
  overlayConfig: {
    titlePosition: "header",
    showTitle: true,
    showLockIcon: false,
    showAddIcon: false,
    showProps: true,
    showCompositionRef: true
  },
  toolbarActions: ["edit", "delete"],
  collapsible: false,
  lockable: false
};
const hubDescriptor = {
  type: "hub",
  category: "leaf",
  zTier: 0.4,
  defaultSize: { width: 240, height: 100 },
  handles: {
    always: true,
    sides: ["left", "right"],
    multiConnect: true,
    outputSides: ["right"],
    inputSides: ["left"]
  },
  isConnectionCandidate: () => true,
  allowedParents: ["subgraph"],
  canBeRoot: true,
  defaultTextureIds: { body: "gg-node-body-default", head: "gg-node-head-default" },
  textureKinds: ["node-body", "node-head"],
  renderMode: "rounded-rect",
  renderConfig: {
    fillColor: [0.12, 0.13, 0.14, 1],
    borderColor: [0.25, 0.27, 0.29, 1],
    borderWidth: 1.5,
    radius: 16
  },
  overlayConfig: {
    titlePosition: "header",
    showTitle: true,
    showLockIcon: false,
    showAddIcon: false,
    showProps: false,
    showCompositionRef: false
  },
  toolbarActions: ["edit", "delete"],
  collapsible: false,
  lockable: false
};
const groupDescriptor = {
  type: "group",
  category: "container",
  zTier: 0,
  defaultSize: { width: 220, height: 200 },
  handles: { always: false, sides: ["left", "right"], multiConnect: false },
  isConnectionCandidate: (mode) => mode === "group",
  allowedParents: ["subgraph"],
  canBeRoot: true,
  defaultTextureIds: { body: "gg-group-body-default", head: "gg-group-head-default" },
  textureKinds: ["group-body", "group-head"],
  renderMode: "textured",
  overlayConfig: {
    titlePosition: "container-top",
    showTitle: false,
    showLockIcon: true,
    showAddIcon: true,
    showProps: false,
    showCompositionRef: false
  },
  toolbarActions: ["spotlight", "edit", "delete"],
  collapsible: false,
  lockable: true,
  usesCanvasLabel: true,
  contributesToChildWorldPosition: true
};
const compositionDescriptor = {
  type: "composition",
  category: "container",
  zTier: 0.2,
  defaultSize: { width: 140, height: 200 },
  handles: { always: false, sides: ["left", "right"], multiConnect: false },
  isConnectionCandidate: (mode) => mode === "node",
  allowedParents: ["group", "subgraph"],
  canBeRoot: false,
  defaultTextureIds: { body: "gg-composition-body-default", head: "gg-composition-head-default" },
  textureKinds: ["composition-body", "composition-head"],
  renderMode: "textured",
  overlayConfig: {
    titlePosition: "container-top",
    showTitle: false,
    showLockIcon: false,
    showAddIcon: false,
    showProps: false,
    showCompositionRef: false
  },
  toolbarActions: ["delete"],
  collapsible: false,
  lockable: false,
  contributesToChildWorldPosition: true
};
const compositionChildDescriptor = {
  type: "composition-child",
  category: "leaf",
  zTier: 0.4,
  defaultSize: { width: 160, height: NODE_LAYOUT.headerHeight },
  handles: { always: false, sides: [], multiConnect: false },
  isConnectionCandidate: () => false,
  allowedParents: ["composition"],
  canBeRoot: false,
  defaultTextureIds: { body: "gg-node-body-default", head: "gg-composition-child-head-default" },
  textureKinds: ["composition-child-head"],
  renderMode: "textured",
  overlayConfig: {
    titlePosition: "center",
    showTitle: true,
    showLockIcon: false,
    showAddIcon: false,
    showProps: false,
    showCompositionRef: false
  },
  toolbarActions: ["edit", "delete"],
  collapsible: false,
  lockable: false
};
const subgraphDescriptor = {
  type: "subgraph",
  category: "container",
  zTier: -0.05,
  defaultSize: { width: 220, height: 160 },
  collapsedSize: { width: 190, height: NODE_LAYOUT.headerHeight },
  handles: {
    always: true,
    sides: ["left", "right"],
    multiConnect: false,
    outputSides: ["right"],
    inputSides: ["left"]
  },
  isConnectionCandidate: (mode) => mode === "node",
  allowedParents: ["subgraph"],
  canBeRoot: true,
  defaultTextureIds: { body: "", head: "" },
  renderMode: "rounded-rect",
  renderConfig: {
    fillColor: [0.11, 0.12, 0.13, 0.95],
    borderColor: [0.22, 0.24, 0.26, 1],
    borderWidth: 1.5,
    radius: 12
  },
  overlayConfig: {
    titlePosition: "header",
    showTitle: true,
    showLockIcon: false,
    showAddIcon: false,
    showProps: false,
    showCompositionRef: false
  },
  toolbarActions: ["collapse", "ungraph", "clone", "edit", "delete"],
  collapsedToolbarActions: ["expand", "clone", "edit", "delete"],
  collapsible: true,
  lockable: false,
  contributesToChildWorldPosition: false
};
const branchDescriptor = {
  type: "branch",
  category: "leaf",
  zTier: 0.4,
  defaultSize: { width: 140, height: 120 },
  handles: {
    always: true,
    sides: ["top", "left", "right"],
    multiConnect: false,
    outputSides: ["left", "right"],
    inputSides: ["top"]
  },
  isConnectionCandidate: () => true,
  allowedParents: ["subgraph"],
  canBeRoot: true,
  defaultTextureIds: { body: "gg-node-body-default", head: "gg-node-head-default" },
  textureKinds: ["node-body", "node-head"],
  renderMode: "rounded-triangle",
  renderConfig: {
    fillColor: [0.1, 0.11, 0.13, 0.95],
    borderColor: [0.45, 0.5, 0.58, 0.9],
    borderWidth: 1.8,
    radius: 10
  },
  overlayConfig: {
    titlePosition: "center",
    showTitle: false,
    showLockIcon: false,
    showAddIcon: false,
    showProps: false,
    showCompositionRef: false
  },
  toolbarActions: ["edit", "delete"],
  collapsible: false,
  lockable: false
};
const BUILTIN_DESCRIPTORS = [
  nodeDescriptor,
  hubDescriptor,
  branchDescriptor,
  groupDescriptor,
  compositionDescriptor,
  compositionChildDescriptor,
  subgraphDescriptor
];
const EDIT = `
<svg style="transform: scale(0.5);"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.9445 9.1875L14.9445 5.1875M18.9445 9.1875L13.946 14.1859C13.2873 14.8446 12.4878 15.3646 11.5699 15.5229C10.6431 15.6828 9.49294 15.736 8.94444 15.1875C8.39595 14.639 8.44915 13.4888 8.609 12.562C8.76731 11.6441 9.28735 10.8446 9.946 10.1859L14.9445 5.1875M18.9445 9.1875C18.9445 9.1875 21.9444 6.1875 19.9444 4.1875C17.9444 2.1875 14.9445 5.1875 14.9445 5.1875M20.5 12C20.5 18.5 18.5 20.5 12 20.5C5.5 20.5 3.5 18.5 3.5 12C3.5 5.5 5.5 3.5 12 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
`;
const UNGRAPH = `
<svg style="transform: scale(0.5);" fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="icon"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M832.6 191.4c-84.6-84.6-221.5-84.6-306 0l-96.9 96.9 51 51 96.9-96.9c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204l-96.9 96.9 51.1 51.1 96.9-96.9c84.4-84.6 84.4-221.5-.1-306.1zM446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l96.9-96.9-51.1-51.1-96.9 96.9c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l96.9-96.9-51-51-96.8 97zM260.3 209.4a8.03 8.03 0 0 0-11.3 0L209.4 249a8.03 8.03 0 0 0 0 11.3l554.4 554.4c3.1 3.1 8.2 3.1 11.3 0l39.6-39.6c3.1-3.1 3.1-8.2 0-11.3L260.3 209.4z"></path> </g></svg>
`;
const CLONE = `
<svg style="transform: scale(0.5);"  viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="var(--ci-primary-color, currentColor)" d="M472,16H160a24.027,24.027,0,0,0-24,24V352a24.027,24.027,0,0,0,24,24H472a24.027,24.027,0,0,0,24-24V40A24.027,24.027,0,0,0,472,16Zm-8,328H168V48H464Z" class="ci-primary"></path> <path fill="var(--ci-primary-color, currentColor)" d="M344,464H48V168h56V136H40a24.027,24.027,0,0,0-24,24V472a24.027,24.027,0,0,0,24,24H352a24.027,24.027,0,0,0,24-24V408H344Z" class="ci-primary"></path> </g></svg>
`;
const DELETE = `
<svg style="transform: scale(0.5);"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17.23 9.78L15.01 12L17.23 14.22C17.52 14.51 17.52 14.99 17.23 15.28C17.08 15.43 16.89 15.5 16.7 15.5C16.51 15.5 16.32 15.43 16.17 15.28L13.95 13.06L11.73 15.28C11.58 15.43 11.39 15.5 11.2 15.5C11.01 15.5 10.82 15.43 10.67 15.28C10.38 14.99 10.38 14.51 10.67 14.22L12.89 12L10.67 9.78C10.38 9.49 10.38 9.01 10.67 8.72C10.96 8.43 11.44 8.43 11.73 8.72L13.95 10.94L16.17 8.72C16.46 8.43 16.94 8.43 17.23 8.72C17.52 9.01 17.52 9.49 17.23 9.78ZM21.32 7V17C21.32 17.96 20.54 18.75 19.57 18.75H7.64C7.02999 18.75 6.48 18.44 6.16 17.93L2.87 12.66C2.62 12.26 2.62 11.74 2.87 11.33L6.16 6.07C6.48 5.56 7.04 5.25 7.64 5.25H19.58C20.54 5.25 21.33 6.04 21.33 7H21.32ZM19.82 7C19.82 6.86 19.71 6.75 19.57 6.75H7.64C7.54999 6.75 7.47 6.79 7.43 6.87L4.22 12L7.43 17.13C7.48 17.2 7.56 17.25 7.64 17.25H19.58C19.72 17.25 19.83 17.14 19.83 17V7H19.82Z" fill="currentColor"></path> </g></svg>
`;
const EXPAND = `
<svg style="transform: scale(0.5);"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Arrow / Expand"> <path id="Vector" d="M10 19H5V14M14 5H19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
`;
const COLLAPSE = `
<svg style="transform: scale(0.5);"  fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M12.36,1H3.64A2.64,2.64,0,0,0,1,3.64v8.72A2.64,2.64,0,0,0,3.64,15h8.72A2.64,2.64,0,0,0,15,12.36V3.64A2.64,2.64,0,0,0,12.36,1ZM13.6,12.36a1.25,1.25,0,0,1-1.24,1.24H3.64A1.25,1.25,0,0,1,2.4,12.36V3.64A1.25,1.25,0,0,1,3.64,2.4h8.72A1.25,1.25,0,0,1,13.6,3.64ZM4,8.71h8V7.31H4Z"></path> </g> </g></svg>
`;
const SPOTLIGHT = `
<svg style="transform: scale(0.5);" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" id="brightness" class="icon glyph"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><circle cx="12" cy="12" r="5"></circle><path d="M12,5a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5Z"></path><path d="M17.66,7.34a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34Z"></path><path d="M21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Z"></path><path d="M18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41Z"></path><path d="M12,19a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19Z"></path><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17Z"></path><path d="M5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Z"></path><path d="M5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Z"></path></g></svg>
`;
function serializeGraph(params) {
  const {
    store,
    edgeStore,
    textureSources,
    theme,
    connectionMode,
    bgColor,
    fontColor,
    camera
  } = params;
  const nodes = [];
  for (const node of store.allNodesMap.values()) {
    nodes.push({
      id: node.id,
      nodeType: node.nodeType,
      localX: node.localX,
      localY: node.localY,
      width: node.width,
      height: node.height,
      text: node.text,
      textureIds: { body: node.textureIds.body, head: node.textureIds.head },
      parentId: node.parentId,
      childIds: [...node.childIds],
      compositionRefId: node.compositionRefId,
      isLocked: node.isLocked || void 0,
      isCollapsed: node.isCollapsed || void 0,
      props: cloneNodeProps(node.props)
    });
  }
  const edges = [];
  for (const edge of edgeStore.allEdges()) {
    edges.push({
      id: edge.id,
      sourceNodeId: edge.sourceNodeId,
      sourceHandleSide: edge.sourceHandleSide,
      targetNodeId: edge.targetNodeId,
      targetHandleSide: edge.targetHandleSide,
      edgeType: edge.edgeType,
      headType: edge.headType,
      headSkinId: edge.headSkinId,
      label: edge.label
    });
  }
  const textures = [];
  for (const source of textureSources) {
    if (source.sourceType === "upload") {
      textures.push({
        id: source.id,
        label: source.label,
        kind: source.kind,
        svgText: source.svgText
      });
    }
  }
  return {
    version: 1,
    editor: {
      theme,
      connectionMode,
      bgColor: [...bgColor],
      fontColor: [...fontColor],
      camera: { panX: camera.panX, panY: camera.panY, zoom: camera.zoom }
    },
    nodes,
    edges,
    textures,
    counters: {
      nodeId: store.nextNodeId - 1,
      // _nextId (internal counter)
      edgeId: edgeStore.nextEdgeId - 1
      // _nextId (internal counter)
    }
  };
}
function deserializeGraph(params) {
  const { snapshot, store, edgeStore, theme, registerTexture } = params;
  if (snapshot.version !== 1) {
    throw new Error(
      `Unsupported graph snapshot version: ${snapshot.version}. Expected 1.`
    );
  }
  store.clear();
  edgeStore.clear();
  if (registerTexture) {
    for (const tex of snapshot.textures) {
      registerTexture({
        id: tex.id,
        label: tex.label,
        kind: tex.kind,
        svgText: tex.svgText
      });
    }
  }
  const sorted = topologicalSortNodes(snapshot.nodes);
  const importTheme = snapshot.editor.theme ?? theme;
  for (const sn of sorted) {
    const node = store.add(
      sn.localX,
      sn.localY,
      sn.text,
      importTheme,
      sn.nodeType,
      sn.id
    );
    node.textureIds = { body: sn.textureIds.body, head: sn.textureIds.head };
    node.width = sn.width;
    node.height = sn.height;
    node.compositionRefId = sn.compositionRefId;
    node.isLocked = sn.isLocked ?? false;
    node.isCollapsed = sn.isCollapsed ?? false;
    node.props = cloneNodeProps(sn.props);
  }
  for (const sn of sorted) {
    if (sn.parentId !== null) {
      store.setParent(sn.id, sn.parentId);
      const node = store.get(sn.id);
      if (node) {
        node.localX = sn.localX;
        node.localY = sn.localY;
        node.width = sn.width;
        node.height = sn.height;
      }
    }
  }
  for (const se of snapshot.edges) {
    edgeStore.add({
      sourceNodeId: se.sourceNodeId,
      sourceHandleSide: se.sourceHandleSide,
      targetNodeId: se.targetNodeId,
      targetHandleSide: se.targetHandleSide,
      edgeType: se.edgeType,
      headType: se.headType,
      headSkinId: se.headSkinId,
      label: se.label,
      // Bypass multi-connection checks — snapshot is a known-valid state
      sourceCanHaveMultipleConnections: true,
      targetCanHaveMultipleConnections: true,
      idOverride: se.id
    });
  }
  for (const se of snapshot.edges) {
    store.updateHandleConnectionState(se.sourceNodeId, se.sourceHandleSide, true);
    store.updateHandleConnectionState(se.targetNodeId, se.targetHandleSide, true);
  }
  store.restoreIdCounter(snapshot.counters.nodeId);
  edgeStore.restoreIdCounter(snapshot.counters.edgeId);
  return {
    theme: snapshot.editor.theme,
    connectionMode: snapshot.editor.connectionMode,
    bgColor: [...snapshot.editor.bgColor],
    fontColor: [...snapshot.editor.fontColor],
    camera: { ...snapshot.editor.camera }
  };
}
function topologicalSortNodes(nodes) {
  const nodeMap = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }
  const sorted = [];
  const visited = /* @__PURE__ */ new Set();
  function visit(node) {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    if (node.parentId !== null) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        visit(parent);
      }
    }
    sorted.push(node);
  }
  for (const node of nodes) {
    visit(node);
  }
  return sorted;
}
const baseButtons = (items) => items.map(([action, glyph, label]) => ({ action, glyph, label }));
const TOOLBAR_ACTION_MAP = {
  edit: [EDIT, "Edit"],
  delete: [DELETE, "Delete"],
  clone: [CLONE, "Clone"],
  collapse: [COLLAPSE, "Collapse"],
  expand: [EXPAND, "Expand"],
  ungraph: [UNGRAPH, "Ungraph"],
  spotlight: [SPOTLIGHT, "Spotlight"]
};
const _NodeEditor = class _NodeEditor {
  constructor(canvasId, backgroundCanvasId, vsSource, fsSource, bgVsSource, bgFsSource, msdfVsSource, msdfFsSource, IconBGVsSource, IconBGFsSource, options = {}, nodeTextureUploadList) {
    __publicField(this, "events", new GraphEventEmitter());
    __publicField(this, "typeRegistry", new NodeTypeRegistry());
    __publicField(this, "cameraDirty", false);
    __publicField(this, "camera");
    __publicField(this, "store");
    __publicField(this, "edgeStore");
    __publicField(this, "pickFBO");
    __publicField(this, "renderer");
    __publicField(this, "controls");
    __publicField(this, "history");
    __publicField(this, "bgColor", [
      7 / 255,
      7 / 255,
      8 / 255,
      1
    ]);
    __publicField(this, "fontColor", [
      (255 - 7) / 255,
      (255 - 7) / 255,
      (255 - 8) / 255,
      1
    ]);
    __publicField(this, "theme", "dark");
    __publicField(this, "draggingNode", null);
    __publicField(this, "dragSnapshot", null);
    __publicField(this, "dragOffsetX", 0);
    __publicField(this, "dragOffsetY", 0);
    __publicField(this, "isPanning", false);
    __publicField(this, "lastMouseX", 0);
    __publicField(this, "lastMouseY", 0);
    __publicField(this, "connectionMode");
    __publicField(this, "activeConnectionDrag", null);
    __publicField(this, "hoveredHandle", null);
    __publicField(this, "assetsPath");
    __publicField(this, "selectedNodeIds", /* @__PURE__ */ new Set());
    __publicField(this, "selectedEdgeIds", /* @__PURE__ */ new Set());
    __publicField(this, "selectionKind", null);
    __publicField(this, "isMultiSelectMode", false);
    __publicField(this, "activeLabelEdit", null);
    __publicField(this, "selectionRep", null);
    __publicField(this, "draggingSelection", null);
    __publicField(this, "selectionToolbar", null);
    __publicField(this, "selectionToolbarNodeId", null);
    __publicField(this, "selectionToolbarActionSignature", "");
    __publicField(this, "overlays", /* @__PURE__ */ new Map());
    __publicField(this, "scalingOverlayContainer");
    __publicField(this, "fixedOverlayContainer");
    __publicField(this, "resizeObserver");
    __publicField(this, "activeTouches", /* @__PURE__ */ new Map());
    __publicField(this, "gestureMode", false);
    __publicField(this, "pinchDistance", null);
    __publicField(this, "msdfAtlas");
    __publicField(this, "iconAtlas");
    __publicField(this, "dpr", 1);
    __publicField(this, "zoomThrottleTimer", null);
    __publicField(this, "ZOOM_THROTTLE_MS", 180);
    this.canvasId = canvasId;
    this.backgroundCanvasId = backgroundCanvasId;
    this.vsSource = vsSource;
    this.fsSource = fsSource;
    this.bgVsSource = bgVsSource;
    this.bgFsSource = bgFsSource;
    this.msdfVsSource = msdfVsSource;
    this.msdfFsSource = msdfFsSource;
    this.IconBGVsSource = IconBGVsSource;
    this.IconBGFsSource = IconBGFsSource;
    this.nodeTextureUploadList = nodeTextureUploadList;
    const canvas = document.getElementById(canvasId);
    const backgroundCanvas = document.getElementById(
      backgroundCanvasId
    );
    if (!canvas) throw new Error(`Canvas "${canvasId}" not found`);
    if (!backgroundCanvas)
      throw new Error(`Canvas "${backgroundCanvasId}" not found`);
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 is not supported in this browser");
    this.connectionMode = options.connectionMode ?? "node";
    this.assetsPath = options.assetsPath ?? "assets";
    for (const descriptor of BUILTIN_DESCRIPTORS) {
      this.typeRegistry.register(descriptor);
    }
    this.camera = new Camera(this);
    this.store = new NodeStore(
      gl,
      this.connectionMode,
      options.handleStyle ?? DEFAULT_HANDLE_STYLE,
      this.typeRegistry
    );
    this.edgeStore = new EdgeStore();
    this.history = new HistoryStack();
    this.pickFBO = new PickFBO(gl, canvas.width, canvas.height);
  }
  get debug() {
    return this.events.debug;
  }
  set debug(value) {
    this.events.debug = value;
  }
  static async create(canvasId, backgroundCanvasId, vsSource, fsSource, bgVsSource, bgFsSource, msdfVsSource, msdfFsSource, IconBGVsSource, IconBGFsSource, options = {}, nodeTextureUploadList = []) {
    if (this._instance) return this._instance;
    this._instance = new _NodeEditor(
      canvasId,
      backgroundCanvasId,
      vsSource,
      fsSource,
      bgVsSource,
      bgFsSource,
      msdfVsSource,
      msdfFsSource,
      IconBGVsSource,
      IconBGFsSource,
      options,
      nodeTextureUploadList
    );
    await this._instance.init();
    return this._instance;
  }
  async init() {
    const canvas = document.getElementById(this.canvasId);
    const gl = canvas.getContext("webgl2");
    const program = createProgram(gl, this.vsSource, this.fsSource);
    const msdfProgram = createProgram(gl, this.msdfVsSource, this.msdfFsSource);
    const iconBGProgam = createProgram(
      gl,
      this.IconBGVsSource,
      this.IconBGFsSource
    );
    const bgProgram = createProgram(gl, this.bgVsSource, this.bgFsSource);
    this.msdfAtlas = new MsdfAtlas(gl);
    this.iconAtlas = new MsdfAtlas(gl);
    const assetsPath = this.assetsPath;
    const basePath = assetsPath.endsWith("/") ? assetsPath : `${assetsPath}/`;
    try {
      await Promise.all([
        this.msdfAtlas.load(
          `${basePath}msdf-atlas.png`,
          `${basePath}msdf-atlas.json`
        ),
        this.iconAtlas.load(
          `${basePath}icon-atlas.png`,
          `${basePath}icon-atlas.json`
        )
      ]);
    } catch (err) {
      throw new Error("assets failed to load!");
    }
    const locations = getShaderLocations(gl, program);
    const bgLocations = getBGShaderLocations(gl, bgProgram);
    const backgroundCanvas = document.getElementById(
      this.backgroundCanvasId
    );
    const labelCanvas = document.getElementById(
      "2d-label-canvas"
    );
    const geometry = new GeometryNode(gl, "rounded-square");
    const bgGeometry = new BGGeometryNode(gl, "dotted", backgroundCanvas);
    const scalingContainer = document.getElementById("gg-overlays-scaling");
    const fixedContainer = document.getElementById("gg-overlays-fixed");
    if (scalingContainer) this.scalingOverlayContainer = scalingContainer;
    if (fixedContainer) this.fixedOverlayContainer = fixedContainer;
    this.renderer = new Renderer(
      gl,
      canvas,
      backgroundCanvas,
      program,
      locations,
      geometry,
      bgGeometry,
      this.store,
      this.edgeStore,
      this.camera,
      bgProgram,
      bgLocations,
      labelCanvas,
      () => this.activeConnectionDrag,
      () => this.bgColor,
      () => this.fontColor,
      () => this.selectedNodeIds,
      () => {
        this.updateSelectionToolbarPosition();
        this.updateOverlays();
      },
      msdfProgram,
      iconBGProgam,
      this.msdfAtlas,
      this.iconAtlas,
      this.typeRegistry
    );
    const container = document.getElementById("sidebar");
    const historyPane = document.getElementById("undo-redo-wrapper");
    const toolPane = document.getElementById("tool-panel");
    if (!container) throw new Error('"sidebar" element not found');
    if (!toolPane) throw new Error('"tool-panel" element not found');
    this.uploadTextureSources();
    this.selectionToolbar = document.createElement(
      "gg-selection-toolbar"
    );
    document.body.appendChild(this.selectionToolbar);
    this.selectionToolbar.addEventListener(
      "gg-selection-toolbar-action",
      (e) => {
        const customEvent = e;
        this.handleSelectionToolbarAction(customEvent.detail.action);
      }
    );
    this.controls = new UIControls(canvas, container, historyPane, toolPane, {
      onAddNode: () => this.handleAddNode(canvas, "node"),
      onAddGroup: () => this.handleAddNode(canvas, "group"),
      onAddBranch: () => this.handleAddNode(canvas, "branch"),
      onAddComposition: () => this.handleAddComposition(canvas),
      onToggleMultiSelect: () => this.toggleMultiSelectMode(),
      onUndo: () => this.undo(),
      onRedo: () => this.redo(),
      onDeleteNode: () => this.handleDeleteSelected(),
      onImport: () => this.handleImport(),
      onExport: () => this.handleExport(),
      onSubgraphCreate: () => this.handleSubgraphCreation(),
      onBgColorChange: (r, g, b, a) => {
        this.bgColor = [r, g, b, a];
      },
      onFontColorChange: (r, g, b, a) => {
        this.fontColor = [r, g, b, a];
      },
      onThemeChange: (theme) => {
        this.theme = theme;
        TextureRegistry.theme = theme;
        this.store.regenerateTextures(theme);
        this.renderer.invalidateTextures();
      },
      onGlobalTextureChange: (kind, textureId) => {
        this.handleGlobalTextureChange(kind, textureId);
      },
      onLabelChange: (newLabel) => {
        const selected = this.getSingleSelectedNode();
        if (selected && selected.nodeType !== "composition") {
          this.store.updateLabel(selected.id, newLabel, this.theme);
        }
      },
      onLabelCommit: () => this.commitLabelEdit(),
      onPointerDown: (e) => this.handlePointerDown(e, canvas),
      onPointerMove: (e) => this.handlePointerMove(e, canvas),
      onPointerUp: (e) => this.handlePointerUp(e, canvas),
      onPointerCancel: (e) => this.handlePointerCancel(e, canvas),
      onWheel: (e) => this.handleWheel(e, canvas)
    });
    this.controls.setMultiSelectActive(this.isMultiSelectMode);
    this.resizeObserver = new ResizeObserver(() => this.handleResize(canvas));
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener(
      "pointercancel",
      (e) => this.handlePointerCancel(e, canvas)
    );
    this.setupPropGroupListener();
    this.handleResize(canvas);
    this.syncToolbarState();
  }
  setupPropGroupListener() {
    this.controls.nodePropGroup.addEventListener(
      "gg-prop-change",
      (e) => {
        const customEvent = e;
        const { label, value } = customEvent.detail;
        if (this.selectedNodeIds.size === 1) {
          const nodeId = Array.from(this.selectedNodeIds)[0];
          const node = this.store.get(nodeId);
          if (node && node.props) {
            const beforeSnapshot = this.captureNodeSnapshot(node);
            const selectionBefore = this.captureSelectionSnapshot();
            const didChange = this.updatePropValue(node.props, label, value);
            if (!didChange) return;
            this.store.syncNodePresentation(node.id);
            const afterSnapshot = this.captureNodeSnapshot(node);
            const parentId = node.parentId;
            if (parentId !== null) {
              this.refreshContainerChain(parentId);
            }
            this.pushCommand(
              new UpdatePropCommand({
                beforeSnapshot,
                afterSnapshot,
                selectionBefore,
                parentId
              })
            );
            this.events.dispatch("node:propChange", {
              nodeId: node.id,
              nodeType: node.nodeType,
              label,
              value
            });
          }
        }
      }
    );
  }
  syncPropertiesPanelForSelection() {
    const selected = this.getSingleSelectedNode();
    if (selected && selected.nodeType !== "composition") {
      this.controls.showProperties(selected);
      return;
    }
    this.controls.hideProperties();
  }
  updatePropValue(props, targetLabel, newValue) {
    if (!props) return false;
    const primitives = [
      ...Object.values(props.booleans || {}).flat(),
      ...Object.values(props.texts || {}).flat(),
      ...Object.values(props.enums || {}).flat()
    ];
    for (const primitive of primitives) {
      if (primitive.label === targetLabel) {
        if (primitive.value === newValue) return false;
        primitive.value = newValue;
        return true;
      }
    }
    return false;
  }
  validateConfig(config) {
    return {
      connectionMode: config.connectionMode ?? "node",
      handleStyle: config.handleStyle ?? DEFAULT_HANDLE_STYLE,
      assetsPath: config.assetsPath ?? "assets"
    };
  }
  distance(p1, p2) {
    const dx = p2.clientX - p1.clientX;
    const dy = p2.clientY - p1.clientY;
    return Math.hypot(dx, dy);
  }
  midpoint(p1, p2) {
    return {
      x: (p1.clientX + p2.clientX) / 2,
      y: (p1.clientY + p2.clientY) / 2
    };
  }
  uploadTextureSources() {
    for (const textureUpload of this.nodeTextureUploadList) {
      TextureRegistry.addUploaded(textureUpload);
    }
  }
  render() {
    this.renderer.startLoop();
  }
  setConnectionMode(connectionMode) {
    this.connectionMode = connectionMode;
    this.store.setConnectionMode(connectionMode);
  }
  /**
   * Serialize the full graph state into a portable JSON-compatible snapshot.
   *
   * Only persistent fields are captured — transient rendering state is omitted.
   * The returned object can be passed to `JSON.stringify()` for persistence.
   */
  exportGraph() {
    return serializeGraph({
      store: this.store,
      edgeStore: this.edgeStore,
      textureSources: TextureRegistry.sources.values(),
      theme: this.theme,
      connectionMode: this.connectionMode,
      bgColor: this.bgColor,
      fontColor: this.fontColor,
      camera: this.camera
    });
  }
  /**
   * Restore the editor to a previously exported graph snapshot.
   *
   * This clears all existing state (nodes, edges, history) and rebuilds
   * from the snapshot. The operation is **not undoable** — it replaces the
   * entire editor state as a fresh baseline.
   */
  importGraph(snapshot) {
    const editorState = deserializeGraph({
      snapshot,
      store: this.store,
      edgeStore: this.edgeStore,
      theme: this.theme,
      registerTexture: (params) => {
        TextureRegistry.addUploaded(params);
      }
    });
    this.theme = editorState.theme;
    TextureRegistry.theme = editorState.theme;
    this.store.regenerateTextures(editorState.theme);
    this.renderer.invalidateTextures();
    this.connectionMode = editorState.connectionMode;
    this.store.setConnectionMode(editorState.connectionMode);
    this.bgColor = [...editorState.bgColor];
    this.fontColor = [...editorState.fontColor];
    this.camera.panX = editorState.camera.panX;
    this.camera.panY = editorState.camera.panY;
    this.camera.zoom = editorState.camera.zoom;
    this.clearSelectionState();
    this.history.clear();
    this.syncToolbarState();
  }
  /**
   * Add a custom DOM overlay component to the canvas.
   */
  addOverlay(overlay) {
    if (this.overlays.has(overlay.id)) {
      this.removeOverlay(overlay.id);
    }
    this.overlays.set(overlay.id, overlay);
    overlay.element.style.position = "absolute";
    if (!overlay.element.style.pointerEvents) {
      overlay.element.style.pointerEvents = "auto";
    }
    if (overlay.scaleWithZoom !== false) {
      overlay.element.style.left = `${overlay.worldX}px`;
      overlay.element.style.top = `${overlay.worldY}px`;
      if (this.scalingOverlayContainer) {
        this.scalingOverlayContainer.appendChild(overlay.element);
      }
    } else {
      overlay.element.style.left = "0px";
      overlay.element.style.top = "0px";
      if (this.fixedOverlayContainer) {
        this.fixedOverlayContainer.appendChild(overlay.element);
      }
    }
    this.updateOverlays();
  }
  /**
   * Remove a custom DOM overlay component by ID.
   */
  removeOverlay(id) {
    const overlay = this.overlays.get(id);
    if (overlay) {
      overlay.element.remove();
      this.overlays.delete(id);
    }
  }
  /**
   * Retrieve a custom DOM overlay component by ID.
   */
  getOverlay(id) {
    return this.overlays.get(id);
  }
  /**
   * Update the world position of an existing overlay component.
   */
  updateOverlayPosition(id, worldX, worldY) {
    const overlay = this.overlays.get(id);
    if (overlay) {
      overlay.worldX = worldX;
      overlay.worldY = worldY;
      if (overlay.scaleWithZoom !== false) {
        overlay.element.style.left = `${worldX}px`;
        overlay.element.style.top = `${worldY}px`;
      }
      this.updateOverlays();
    }
  }
  /**
   * Convert a world-space coordinate to screen-space pixel coordinates.
   */
  worldToScreen(worldX, worldY) {
    return this.camera.worldToScreen(worldX, worldY);
  }
  /**
   * Convert a screen-space pixel coordinate to world-space coordinates.
   */
  screenToWorld(screenX, screenY) {
    return this.camera.screenToWorld(screenX, screenY);
  }
  /**
   * Get the current camera viewport state (panX, panY, zoom).
   */
  getCameraState() {
    return {
      panX: this.camera.panX,
      panY: this.camera.panY,
      zoom: this.camera.zoom
    };
  }
  /**
   * Synchronize overlay container transforms with current camera pan and zoom.
   */
  updateOverlays() {
    const { panX, panY, zoom } = this.camera;
    if (this.scalingOverlayContainer) {
      this.scalingOverlayContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    }
    if (this.fixedOverlayContainer) {
      this.fixedOverlayContainer.style.transform = `translate(${panX}px, ${panY}px)`;
    }
    for (const overlay of this.overlays.values()) {
      if (overlay.scaleWithZoom === false) {
        overlay.element.style.transform = `translate(${overlay.worldX * zoom}px, ${overlay.worldY * zoom}px)`;
        overlay.element.style.transformOrigin = "0 0";
      }
    }
    if (!this.cameraDirty) return;
    this.events.dispatch("camera:change", { panX, panY, zoom });
  }
  handleExport() {
    const snapshot = this.exportGraph();
    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graph-giraffe-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = (e) => {
      var _a2;
      const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        var _a3;
        try {
          const content = (_a3 = event.target) == null ? void 0 : _a3.result;
          const snapshot = JSON.parse(content);
          this.importGraph(snapshot);
        } catch (err) {
          console.error("Failed to parse imported graph JSON:", err);
          alert("Invalid graph JSON file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
  handleGlobalTextureChange(kind, textureId) {
    const applyToNodes = (nodes) => {
      for (const node of nodes) {
        if (isNodePrimitiveType(node.nodeType) && kind === "node-body" || node.nodeType === "group" && kind === "group-body" || node.nodeType === "composition" && kind === "composition-body" || node.nodeType === "composition-child" && kind === "node-body" || // fallback for body
        node.nodeType === "node" && node.compositionRefId !== null && kind === "composition-reference-body") {
          if (node.textureIds.body !== textureId) {
            node.textureIds.body = textureId;
          }
        }
        if (isNodePrimitiveType(node.nodeType) && kind === "node-head" || node.nodeType === "group" && kind === "group-head" || node.nodeType === "composition" && kind === "composition-head" || node.nodeType === "composition-child" && kind === "composition-child-head" || node.nodeType === "node" && node.compositionRefId !== null && kind === "composition-reference-child-head") {
          if (node.textureIds.head !== textureId) {
            node.textureIds.head = textureId;
          }
        }
      }
    };
    applyToNodes(this.store.nodes.values());
    applyToNodes(this.store.groups.values());
  }
  undo() {
    const cmd = this.history.undo(this.commandContext);
    if (!cmd) return;
    this.events.dispatch("history:command", { command: cmd, action: "undo" });
    this.syncToolbarState();
  }
  redo() {
    const cmd = this.history.redo(this.commandContext);
    if (!cmd) return;
    this.events.dispatch("history:command", { command: cmd, action: "redo" });
    this.syncToolbarState();
  }
  handleResize(canvas) {
    const rect = canvas.getBoundingClientRect();
    this.dpr = typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
    const physicalWidth = Math.round(rect.width * this.dpr);
    const physicalHeight = Math.round(rect.height * this.dpr);
    canvas.width = physicalWidth;
    canvas.height = physicalHeight;
    this.renderer.resize(physicalWidth, physicalHeight, this.dpr);
    this.pickFBO.resize(physicalWidth, physicalHeight);
  }
  pushCommand(command) {
    this.history.push(command);
    this.events.dispatch("history:command", { command, action: "do" });
    this.syncToolbarState();
  }
  get commandContext() {
    return {
      store: this.store,
      edgeStore: this.edgeStore,
      theme: this.theme,
      applyNodeSnapshot: (s) => this.applyNodeSnapshot(s),
      restoreNodeSnapshots: (s) => this.restoreNodeSnapshots(s),
      restoreEdgeSnapshots: (s) => this.restoreEdgeSnapshots(s),
      removeNodeAndIncidentEdges: (id) => this.removeNodeAndIncidentEdges(id),
      removeNodesAndEdges: (nIds, eIds) => this.removeNodesAndEdges(nIds, eIds),
      removeContainerOnly: (id) => this.removeContainerOnly(id),
      clearSelectionState: () => this.clearSelectionState(),
      setNodeSelected: (id, sel) => this.setNodeSelected(id, sel),
      restoreSelectionSnapshot: (s) => this.restoreSelectionSnapshot(s),
      refreshContainerChain: (id) => this.refreshContainerChain(id),
      syncPropertiesPanel: () => this.syncPropertiesPanelForSelection(),
      syncToolbarState: () => this.syncToolbarState(),
      syncHandleStates: (id) => this.syncHandleStates(id),
      applyCompositionReferenceForEdge: (e) => this.applyCompositionReferenceForEdge(e),
      clearCompositionReferenceForEdge: (e) => this.clearCompositionReferenceForEdge(e)
    };
  }
  captureSelectionSnapshot() {
    return {
      kind: this.selectionKind,
      nodeIds: [...this.selectedNodeIds],
      edgeIds: [...this.selectedEdgeIds]
    };
  }
  clearSelectionState() {
    this.selectedNodeIds.forEach((nodeId) => {
      const node = this.store.get(nodeId);
      if (node) node.isSelected = false;
    });
    this.selectedEdgeIds.forEach((edgeId) => {
      const edge = this.edgeStore.get(edgeId);
      if (edge) edge.isSelected = false;
    });
    this.selectedNodeIds.clear();
    this.selectedEdgeIds.clear();
    this.selectionKind = null;
    this.selectionRep = null;
    this.syncSelectionToolbar();
  }
  syncSelectionKind() {
    if (this.selectedNodeIds.size > 0 && this.selectedEdgeIds.size > 0) {
      return;
    }
    if (this.selectedNodeIds.size > 0) {
      this.selectionKind = "node";
      return;
    }
    if (this.selectedEdgeIds.size > 0) {
      this.selectionKind = "edge";
      return;
    }
    this.selectionKind = null;
  }
  setNodeSelected(nodeId, isSelected) {
    const node = this.store.get(nodeId);
    if (!node) return;
    node.isSelected = isSelected;
    if (isSelected) {
      this.selectedNodeIds.add(nodeId);
    } else {
      this.selectedNodeIds.delete(nodeId);
    }
    this.syncSelectionKind();
    this.syncSelectionToolbar();
  }
  setEdgeSelected(edgeId, isSelected) {
    const edge = this.edgeStore.get(edgeId);
    if (!edge) return;
    edge.isSelected = isSelected;
    if (isSelected) {
      this.selectedEdgeIds.add(edgeId);
    } else {
      this.selectedEdgeIds.delete(edgeId);
    }
    this.syncSelectionKind();
    this.syncSelectionToolbar();
  }
  selectOnlyNode(nodeId) {
    this.clearSelectionState();
    this.setNodeSelected(nodeId, true);
  }
  selectOnlyEdge(edgeId) {
    this.clearSelectionState();
    this.setEdgeSelected(edgeId, true);
  }
  captureNodePlacement(node) {
    return {
      localX: node.localX,
      localY: node.localY,
      parentId: node.parentId
    };
  }
  collectSubtreeIds(rootIds) {
    const collected = /* @__PURE__ */ new Set();
    const visit = (nodeId) => {
      if (collected.has(nodeId)) return;
      const node = this.store.get(nodeId);
      if (!node) return;
      collected.add(nodeId);
      for (const childId of node.childIds) {
        visit(childId);
      }
    };
    for (const rootId of rootIds) {
      visit(rootId);
    }
    return [...collected];
  }
  pickIgnoringNodeIds(screenX, screenY, hiddenNodeIds) {
    const hiddenIds = new Set(hiddenNodeIds);
    const hiddenNodes = [];
    for (const nodeId of hiddenIds) {
      const node = this.store.get(nodeId);
      if (!node || !node.visible) continue;
      node.visible = false;
      hiddenNodes.push(node);
    }
    const pickedId = this.pick(screenX, screenY);
    for (const node of hiddenNodes) {
      node.visible = true;
    }
    return pickedId;
  }
  getSelectionDragRoots() {
    if (this.selectedNodeIds.size === 0 || this.selectedEdgeIds.size > 0) {
      return [];
    }
    const selectedIds = new Set(this.selectedNodeIds);
    const roots = [];
    for (const nodeId of this.selectedNodeIds) {
      const node = this.store.get(nodeId);
      if (!node) continue;
      let currentParentId = node.parentId;
      let isDescendantOfSelection = false;
      while (currentParentId !== null) {
        if (selectedIds.has(currentParentId)) {
          isDescendantOfSelection = true;
          break;
        }
        const parent = this.store.get(currentParentId);
        currentParentId = (parent == null ? void 0 : parent.parentId) ?? null;
      }
      if (!isDescendantOfSelection && !this.isInLockedGroup(nodeId)) {
        roots.push(node);
      }
    }
    return roots;
  }
  startSelectionDrag(worldX, worldY, selectionRep) {
    const roots = this.getSelectionDragRoots();
    if (roots.length === 0) return;
    this.selectionRep = selectionRep;
    this.draggingSelection = {
      startWorldX: worldX,
      startWorldY: worldY,
      entries: roots.map((node) => ({
        nodeId: node.id,
        beforePlacement: this.captureNodePlacement(node),
        beforeWorld: getWorldPosition(node.id, this.store.allNodesMap)
      }))
    };
  }
  moveSelectionDrag(worldX, worldY, screenX, screenY) {
    const selectionDrag = this.draggingSelection;
    if (!selectionDrag) return;
    const deltaX = worldX - selectionDrag.startWorldX;
    const deltaY = worldY - selectionDrag.startWorldY;
    for (const entry of selectionDrag.entries) {
      const node = this.store.get(entry.nodeId);
      if (!node) continue;
      const targetX = entry.beforeWorld.x + deltaX;
      const targetY = entry.beforeWorld.y + deltaY;
      if (entry.beforePlacement.parentId === null) {
        node.localX = targetX;
        node.localY = targetY;
        continue;
      }
      const parentWorld = getParentFrameWorldPosition(
        entry.beforePlacement.parentId,
        this.store.allNodesMap
      );
      node.localX = targetX - parentWorld.x;
      node.localY = targetY - parentWorld.y;
    }
    const owningSubgraphIds = /* @__PURE__ */ new Set();
    for (const entry of selectionDrag.entries) {
      const owningSubgraphId = this.getOwningSubgraphId(entry.nodeId);
      if (owningSubgraphId !== null) {
        owningSubgraphIds.add(owningSubgraphId);
      }
    }
    if (owningSubgraphIds.size > 0) {
      this.refreshContainerChains(owningSubgraphIds);
    }
    this.store.clearDropTargets();
    if (this.selectionRep && this.selectionRep.nodeType !== "group") {
      const hoveredContainer = this.inferSelectionDropTarget(
        screenX,
        screenY,
        selectionDrag
      );
      if (hoveredContainer) {
        hoveredContainer.isDropTarget = true;
      }
    }
  }
  inferSelectionDropTarget(screenX, screenY, selectionDrag) {
    if (!this.selectionRep || this.selectionRep.nodeType === "group") {
      return null;
    }
    const hiddenIds = this.collectSubtreeIds(
      selectionDrag.entries.map((entry) => entry.nodeId)
    );
    const pickedId = this.pickIgnoringNodeIds(screenX, screenY, hiddenIds);
    if (pickedId === 0) return null;
    let pickedNode = this.store.get(pickedId);
    while (pickedNode) {
      if (pickedNode.id !== this.selectionRep.id && isContainerNodeType(pickedNode.nodeType)) {
        if (this.selectionRep.nodeType === "composition") {
          return pickedNode.nodeType === "group" || pickedNode.nodeType === "subgraph" ? pickedNode : null;
        }
        return pickedNode;
      }
      if (pickedNode.parentId === null) break;
      pickedNode = this.store.get(pickedNode.parentId);
    }
    return null;
  }
  async applySelectionDrop(selectionDrag, hoveredContainer) {
    const rootIds = selectionDrag.entries.map((entry) => entry.nodeId);
    const beforeSnapshots = this.captureNodeSnapshots(rootIds);
    const cloneSnapshots = [];
    const affectedParents = /* @__PURE__ */ new Set();
    const cloneIds = [];
    const removedReferenceEdgeSnapshots = [];
    let didChange = false;
    if ((hoveredContainer == null ? void 0 : hoveredContainer.nodeType) === "composition") {
      if (this.selectionRep && this.selectionRep.nodeType !== "group") {
        const targetOwningSubgraphId = this.getOwningSubgraphId(
          hoveredContainer.id
        );
        for (const entry of selectionDrag.entries) {
          const node = this.store.get(entry.nodeId);
          if (!node || !isNodePrimitiveType(node.nodeType)) continue;
          const sourceOwningSubgraphId = this.getOwningSubgraphId(node.id);
          if (sourceOwningSubgraphId !== targetOwningSubgraphId) continue;
          const clone = this.store.duplicateIntoComposition(
            node.id,
            hoveredContainer.id,
            this.theme
          );
          if (!clone) continue;
          cloneIds.push(clone.id);
          affectedParents.add(hoveredContainer.id);
          didChange = true;
        }
      }
    } else if ((hoveredContainer == null ? void 0 : hoveredContainer.nodeType) === "subgraph") ;
    else if ((hoveredContainer == null ? void 0 : hoveredContainer.nodeType) === "group") {
      if (this.selectionRep && this.selectionRep.nodeType !== "group") {
        const targetOwningSubgraphId = this.getOwningSubgraphId(
          hoveredContainer.id
        );
        for (const entry of selectionDrag.entries) {
          const node = this.store.get(entry.nodeId);
          if (!node) continue;
          const sourceOwningSubgraphId = this.getOwningSubgraphId(node.id);
          if (sourceOwningSubgraphId !== targetOwningSubgraphId) continue;
          const oldParentId = node.parentId;
          const parentChanged = oldParentId !== hoveredContainer.id;
          if (parentChanged) {
            const allowed = await this.events.dispatchBefore(
              "before:nodeReparent",
              {
                nodeId: node.id,
                nodeType: node.nodeType,
                newParentId: hoveredContainer.id,
                newParentType: hoveredContainer.nodeType
              }
            );
            if (!allowed) continue;
            if (!this.store.setParent(node.id, hoveredContainer.id)) continue;
            this.events.dispatch("node:reparent", {
              nodeId: node.id,
              nodeType: node.nodeType,
              oldParentId,
              newParentId: hoveredContainer.id
            });
          }
          if (oldParentId !== null) {
            affectedParents.add(oldParentId);
          }
          affectedParents.add(hoveredContainer.id);
          didChange = true;
        }
      }
    } else {
      for (const entry of selectionDrag.entries) {
        const node = this.store.get(entry.nodeId);
        if (!node) continue;
        if (node.parentId === null) continue;
        const parent = this.store.get(node.parentId);
        if (!parent || !isContainerNodeType(parent.nodeType)) continue;
        if (this.getOwningSubgraphId(node.id) !== null) continue;
        const oldParentId = node.parentId;
        if (isNodePrimitiveType(node.nodeType)) {
          if (!this.store.setParent(node.id, null)) continue;
          removedReferenceEdgeSnapshots.push(
            ...this.removeCompositionReferenceEdgesForNode(node.id)
          );
          affectedParents.add(oldParentId);
          didChange = true;
          continue;
        }
        if (node.nodeType === "composition" || node.nodeType === "composition-child") {
          affectedParents.add(oldParentId);
          didChange = true;
        }
      }
    }
    this.refreshContainerChains(affectedParents);
    const afterSnapshots = this.captureNodeSnapshots(rootIds);
    for (const cloneId of cloneIds) {
      const clone = this.store.get(cloneId);
      if (!clone) continue;
      cloneSnapshots.push(this.captureNodeSnapshot(clone));
    }
    if (beforeSnapshots.length !== afterSnapshots.length || beforeSnapshots.some((before, index) => {
      const after = afterSnapshots[index];
      return !after || before.localX !== after.localX || before.localY !== after.localY || before.parentId !== after.parentId;
    })) {
      didChange = true;
    }
    return {
      beforeSnapshots,
      afterSnapshots,
      cloneSnapshots,
      removedReferenceEdgeSnapshots,
      affectedParentIds: [...affectedParents],
      didChange
    };
  }
  getSingleSelectedNode() {
    if (this.selectedNodeIds.size !== 1 || this.selectedEdgeIds.size > 0) {
      return null;
    }
    const nodeId = this.selectedNodeIds.values().next().value;
    if (nodeId === void 0) return null;
    return this.store.get(nodeId) ?? null;
  }
  getSelectedGroupTarget() {
    const selected = this.getSingleSelectedNode();
    if (!selected) return null;
    if (selected.nodeType === "group") return selected;
    if (selected.parentId === null) return null;
    const parent = this.store.get(selected.parentId);
    if (parent && parent.nodeType === "group") return parent;
    return null;
  }
  restoreSelectionSnapshot(snapshot) {
    this.clearSelectionState();
    for (const nodeId of snapshot.nodeIds) {
      const node = this.store.get(nodeId);
      if (node) {
        node.isSelected = true;
        this.selectedNodeIds.add(nodeId);
      }
    }
    for (const edgeId of snapshot.edgeIds) {
      const edge = this.edgeStore.get(edgeId);
      if (edge) {
        edge.isSelected = true;
        this.selectedEdgeIds.add(edgeId);
      }
    }
    this.selectionKind = snapshot.kind;
    this.syncSelectionKind();
    this.syncSelectionToolbar();
  }
  clearSelectionAndHideProperties() {
    this.clearSelectionState();
    this.controls.hideProperties();
  }
  toggleMultiSelectMode() {
    this.isMultiSelectMode = !this.isMultiSelectMode;
    this.controls.setMultiSelectActive(this.isMultiSelectMode);
  }
  selectNodeByClick(nodeId) {
    const canExtendSelection = this.isMultiSelectMode && (this.selectionKind === null || this.selectionKind === "node");
    if (!canExtendSelection) {
      this.clearSelectionState();
      this.setNodeSelected(nodeId, true);
      return;
    }
    if (this.selectedNodeIds.has(nodeId)) {
      if (this.selectedNodeIds.size === 1) {
        this.clearSelectionState();
      } else {
        this.setNodeSelected(nodeId, false);
      }
      return;
    }
    this.setNodeSelected(nodeId, true);
  }
  selectEdgeByClick(edgeId) {
    const canExtendSelection = this.isMultiSelectMode && (this.selectionKind === null || this.selectionKind === "edge");
    if (!canExtendSelection) {
      this.clearSelectionState();
      this.setEdgeSelected(edgeId, true);
      return;
    }
    if (this.selectedEdgeIds.has(edgeId)) {
      if (this.selectedEdgeIds.size === 1) {
        this.clearSelectionState();
      } else {
        this.setEdgeSelected(edgeId, false);
      }
      return;
    }
    this.setEdgeSelected(edgeId, true);
  }
  beginLabelEdit(node) {
    this.activeLabelEdit = {
      nodeId: node.id,
      previousLabel: node.text
    };
  }
  commitLabelEdit() {
    const session = this.activeLabelEdit;
    if (!session) return;
    this.activeLabelEdit = null;
    const node = this.store.get(session.nodeId);
    if (!node || node.text === session.previousLabel) return;
    const nextLabel = node.text;
    this.pushCommand(
      new UpdateLabelCommand({
        nodeId: node.id,
        previousLabel: session.previousLabel,
        nextLabel
      })
    );
    this.events.dispatch("node:labelChange", {
      nodeId: node.id,
      nodeType: node.nodeType,
      oldLabel: session.previousLabel,
      newLabel: nextLabel
    });
  }
  captureNodeSnapshot(node) {
    return captureNodeHistorySnapshot(node);
  }
  captureSubtreeSnapshots(rootId) {
    const root = this.store.get(rootId);
    if (!root) return [];
    const snapshots = [];
    const visit = (node) => {
      snapshots.push(this.captureNodeSnapshot(node));
      for (const childId of node.childIds) {
        const child = this.store.get(childId);
        if (child) visit(child);
      }
    };
    visit(root);
    return snapshots;
  }
  captureNodeSnapshots(nodeIds) {
    const snapshots = [];
    const visited = /* @__PURE__ */ new Set();
    for (const nodeId of nodeIds) {
      const root = this.store.get(nodeId);
      if (!root || visited.has(root.id)) continue;
      const visit = (node) => {
        if (visited.has(node.id)) return;
        visited.add(node.id);
        snapshots.push(this.captureNodeSnapshot(node));
        for (const childId of node.childIds) {
          const child = this.store.get(childId);
          if (child) visit(child);
        }
      };
      visit(root);
    }
    return snapshots;
  }
  captureEdgeSnapshots(nodeIds) {
    const nodeIdSet = new Set(nodeIds);
    return this.edgeStore.allEdges().filter(
      (edge) => nodeIdSet.has(edge.sourceNodeId) || nodeIdSet.has(edge.targetNodeId)
    ).map((edge) => ({ ...edge }));
  }
  captureEdgeSnapshotsForSelection(nodeIds, edgeIds) {
    const nodeIdSet = new Set(nodeIds);
    const edgeIdSet = new Set(edgeIds);
    const snapshots = [];
    for (const edge of this.edgeStore.allEdges()) {
      if (edgeIdSet.has(edge.id) || nodeIdSet.has(edge.sourceNodeId) || nodeIdSet.has(edge.targetNodeId)) {
        snapshots.push({ ...edge });
      }
    }
    return snapshots;
  }
  captureBoundaryEdgeSnapshots(rootIds) {
    const subtreeIds = new Set(this.collectSubtreeIds(rootIds));
    const snapshots = [];
    for (const edge of this.edgeStore.allEdges()) {
      const sourceInside = subtreeIds.has(edge.sourceNodeId);
      const targetInside = subtreeIds.has(edge.targetNodeId);
      if (sourceInside === targetInside) continue;
      snapshots.push({ ...edge });
    }
    return snapshots;
  }
  removeBoundaryEdgesForRoots(rootIds) {
    const snapshots = this.captureBoundaryEdgeSnapshots(rootIds);
    for (const snapshot of snapshots) {
      const removed = this.edgeStore.remove(snapshot.id);
      if (!removed) continue;
      this.clearCompositionReferenceForEdge(snapshot);
      this.syncHandleStates(snapshot.sourceNodeId);
      this.syncHandleStates(snapshot.targetNodeId);
    }
    return snapshots;
  }
  applyNodeSnapshot(snapshot) {
    let node = this.store.get(snapshot.id);
    if (!node) {
      node = this.store.add(
        snapshot.localX,
        snapshot.localY,
        snapshot.text,
        this.theme,
        snapshot.nodeType,
        snapshot.id
      );
    }
    node.nodeType = snapshot.nodeType;
    node.localX = snapshot.localX;
    node.localY = snapshot.localY;
    node.width = snapshot.width;
    node.height = snapshot.height;
    node.text = snapshot.text;
    node.textureIds = { ...snapshot.textureIds };
    node.visible = snapshot.visible;
    node.isSelected = snapshot.isSelected;
    node.isDropTarget = snapshot.isDropTarget;
    node.isLocked = snapshot.isLocked;
    node.isCollapsed = snapshot.isCollapsed;
    node.childIds = [...snapshot.childIds];
    node.compositionRefId = snapshot.compositionRefId;
    node.props = cloneNodeProps(snapshot.props);
    node.handles = node.handles.map((handle) => {
      var _a2;
      return {
        ...handle,
        isConnected: ((_a2 = snapshot.handleStates.find((entry) => entry.side === handle.side)) == null ? void 0 : _a2.isConnected) ?? false
      };
    });
    this.store.forceRestoreNodePlacement(
      snapshot.id,
      snapshot.localX,
      snapshot.localY,
      snapshot.parentId
    );
    node.width = snapshot.width;
    node.height = snapshot.height;
  }
  restoreNodeSnapshots(snapshots) {
    for (const snapshot of snapshots) {
      this.applyNodeSnapshot(snapshot);
    }
  }
  restoreEdgeSnapshots(snapshots) {
    for (const snapshot of snapshots) {
      const source = this.store.get(snapshot.sourceNodeId);
      const target = this.store.get(snapshot.targetNodeId);
      const edge = this.edgeStore.add({
        ...snapshot,
        sourceHandleSide: snapshot.sourceHandleSide,
        targetHandleSide: snapshot.targetHandleSide,
        edgeType: snapshot.edgeType,
        headType: snapshot.headType,
        label: snapshot.label,
        isSelected: snapshot.isSelected,
        visible: snapshot.visible,
        idOverride: snapshot.id,
        sourceCanHaveMultipleConnections: (source == null ? void 0 : source.nodeType) === "hub",
        targetCanHaveMultipleConnections: (target == null ? void 0 : target.nodeType) === "hub"
      });
      if (edge) {
        this.syncHandleStates(edge.sourceNodeId);
        this.syncHandleStates(edge.targetNodeId);
        this.applyCompositionReferenceForEdge(edge);
      }
    }
  }
  isCompositionReferenceEdge(edge) {
    const source = this.store.get(edge.sourceNodeId);
    const target = this.store.get(edge.targetNodeId);
    return (source == null ? void 0 : source.nodeType) === "node" && (target == null ? void 0 : target.nodeType) === "composition";
  }
  canCreateCompositionReference(sourceNodeId, targetCompositionId) {
    const source = this.store.get(sourceNodeId);
    const target = this.store.get(targetCompositionId);
    if (!source || !target) return false;
    if (source.nodeType !== "node" || target.nodeType !== "composition") {
      return false;
    }
    if (source.parentId === null) return false;
    const parent = this.store.get(source.parentId);
    if ((parent == null ? void 0 : parent.nodeType) !== "group") return false;
    return source.compositionRefId === null || source.compositionRefId === targetCompositionId;
  }
  applyCompositionReferenceForEdge(edge) {
    if (!this.isCompositionReferenceEdge(edge)) return;
    if (!this.canCreateCompositionReference(edge.sourceNodeId, edge.targetNodeId)) {
      return;
    }
    const source = this.store.get(edge.sourceNodeId);
    const oldParentId = (source == null ? void 0 : source.parentId) ?? null;
    if (this.store.setCompositionReference(
      edge.sourceNodeId,
      edge.targetNodeId,
      this.theme
    )) {
      this.refreshContainerChain(oldParentId);
    }
  }
  clearCompositionReferenceForEdge(edge) {
    if (!this.isCompositionReferenceEdge(edge)) return;
    const source = this.store.get(edge.sourceNodeId);
    if (!source || source.compositionRefId !== edge.targetNodeId) return;
    const oldParentId = source.parentId;
    if (this.store.clearCompositionReference(source.id, this.theme)) {
      this.refreshContainerChain(oldParentId);
    }
  }
  refreshCompositionReferenceNodes(compositionId) {
    const refs = this.store.getCompositionReferenceNodes(compositionId);
    this.store.refreshCompositionReferences(compositionId, this.theme);
    for (const ref of refs) {
      this.refreshContainerChain(ref.parentId);
    }
  }
  removeCompositionReferenceEdgesForNode(nodeId) {
    const removed = [];
    for (const edge of this.edgeStore.allEdges()) {
      if (edge.sourceNodeId !== nodeId) continue;
      if (!this.isCompositionReferenceEdge(edge)) continue;
      const snapshot = { ...edge };
      const removedEdge = this.edgeStore.remove(edge.id);
      if (!removedEdge) continue;
      this.clearCompositionReferenceForEdge(snapshot);
      this.syncHandleStates(snapshot.sourceNodeId);
      this.syncHandleStates(snapshot.targetNodeId);
      removed.push(snapshot);
    }
    return removed;
  }
  /** Zoom the camera to center a group node in the viewport with padding. */
  spotlightGroup(groupId) {
    const node = this.store.get(groupId);
    if (!node) return;
    const world = getWorldPosition(groupId, this.store.allNodesMap);
    const centerX = world.x + node.width / 2;
    const centerY = world.y + node.height / 2;
    const canvas = document.getElementById(this.canvasId);
    const margin = 0.8;
    const targetZoom = Math.min(
      canvas.width * margin / node.width,
      canvas.height * margin / node.height,
      2
    );
    const targetPanX = canvas.width / 2 - centerX * targetZoom;
    const targetPanY = canvas.height / 2 - centerY * targetZoom;
    this.camera.animateTo(targetPanX, targetPanY, targetZoom);
  }
  /** Check if a node is a locked group or is a descendant of one. */
  isInLockedGroup(nodeId) {
    const node = this.store.get(nodeId);
    if (!node) return false;
    if (node.isLocked && node.nodeType === "group") return true;
    let currentId = node.parentId;
    while (currentId !== null) {
      const ancestor = this.store.get(currentId);
      if (!ancestor) break;
      if (ancestor.isLocked && ancestor.nodeType === "group") return true;
      currentId = ancestor.parentId;
    }
    return false;
  }
  /** Returns the nearest subgraph ancestor that owns this node, if any. */
  getOwningSubgraphId(nodeId) {
    const node = this.store.get(nodeId);
    if (!node) return null;
    let currentId = node.parentId;
    while (currentId !== null) {
      const ancestor = this.store.get(currentId);
      if (!ancestor) break;
      if (ancestor.nodeType === "subgraph") return ancestor.id;
      currentId = ancestor.parentId;
    }
    return null;
  }
  getOutermostSubgraphId(nodeId) {
    const node = this.store.get(nodeId);
    if (!node) return null;
    let currentId = node.parentId;
    let outermostSubgraphId = null;
    while (currentId !== null) {
      const ancestor = this.store.get(currentId);
      if (!ancestor) break;
      if (ancestor.nodeType === "subgraph") {
        outermostSubgraphId = ancestor.id;
      }
      currentId = ancestor.parentId;
    }
    return outermostSubgraphId;
  }
  canEnterContainer(sourceOwningSubgraphId, hoveredContainer) {
    var _a2;
    if (((_a2 = this.draggingNode) == null ? void 0 : _a2.nodeType) === "hub" && hoveredContainer.nodeType === "group") {
      return false;
    }
    if (hoveredContainer.nodeType === "subgraph") {
      const hoveredOwningSubgraphId = this.getOwningSubgraphId(
        hoveredContainer.id
      );
      return sourceOwningSubgraphId === hoveredContainer.id || sourceOwningSubgraphId === hoveredOwningSubgraphId;
    }
    return sourceOwningSubgraphId === this.getOwningSubgraphId(hoveredContainer.id);
  }
  async deleteNodeTreeWithHistory(nodeId) {
    const node = this.store.get(nodeId);
    if (!node) return;
    const allowed = await this.events.dispatchBefore("before:nodeDelete", {
      nodeId: node.id,
      nodeType: node.nodeType
    });
    if (!allowed) return;
    this.activeLabelEdit = null;
    const selectionBefore = this.captureSelectionSnapshot();
    const snapshots = this.captureSubtreeSnapshots(nodeId);
    const removedIds = this.store.collectRemovedIds(nodeId);
    const edgeSnapshots = this.captureEdgeSnapshotsForSelection(removedIds, []);
    const parentId = node.parentId;
    this.removeNodeAndIncidentEdges(nodeId);
    this.clearSelectionAndHideProperties();
    if (parentId !== null) {
      this.refreshContainerChain(parentId);
    }
    this.pushCommand(
      new DeleteNodeCommand({
        nodeId,
        nodeSnapshots: snapshots,
        edgeSnapshots,
        selectionBefore,
        parentId
      })
    );
  }
  deleteEdgeWithHistory(edgeId) {
    const edge = this.edgeStore.get(edgeId);
    if (!edge) return;
    this.activeLabelEdit = null;
    const selectionBefore = this.captureSelectionSnapshot();
    const snapshot = { ...edge };
    this.edgeStore.remove(edgeId);
    this.clearCompositionReferenceForEdge(snapshot);
    this.syncHandleStates(edge.sourceNodeId);
    this.syncHandleStates(edge.targetNodeId);
    this.clearSelectionAndHideProperties();
    this.pushCommand(
      new DeleteEdgeCommand({
        edgeSnapshot: snapshot,
        selectionBefore
      })
    );
  }
  async deleteCurrentSelectionWithHistory() {
    let nodeIds = [...this.selectedNodeIds];
    const edgeIds = [...this.selectedEdgeIds];
    if (nodeIds.length === 0 && edgeIds.length === 0) {
      return;
    }
    const filteredNodeIds = [];
    for (const nodeId of nodeIds) {
      const node = this.store.get(nodeId);
      if (!node) continue;
      const allowed = await this.events.dispatchBefore("before:nodeDelete", {
        nodeId: node.id,
        nodeType: node.nodeType
      });
      if (allowed) filteredNodeIds.push(nodeId);
    }
    nodeIds = filteredNodeIds;
    if (nodeIds.length === 0 && edgeIds.length === 0) {
      return;
    }
    if (nodeIds.length === 1 && edgeIds.length === 0) {
      await this.deleteNodeTreeWithHistory(nodeIds[0]);
      return;
    }
    if (nodeIds.length === 0 && edgeIds.length === 1) {
      this.deleteEdgeWithHistory(edgeIds[0]);
      return;
    }
    this.activeLabelEdit = null;
    const selectionBefore = this.captureSelectionSnapshot();
    const snapshots = this.captureNodeSnapshots(nodeIds);
    const removedIds = /* @__PURE__ */ new Set();
    for (const nodeId of nodeIds) {
      for (const removedId of this.store.collectRemovedIds(nodeId)) {
        removedIds.add(removedId);
      }
    }
    const edgeSnapshots = this.captureEdgeSnapshotsForSelection(
      removedIds,
      edgeIds
    );
    const parentIds = /* @__PURE__ */ new Set();
    for (const nodeId of nodeIds) {
      const node = this.store.get(nodeId);
      if (node && node.parentId !== null) {
        parentIds.add(node.parentId);
      }
    }
    this.removeNodesAndEdges(removedIds, edgeIds);
    this.clearSelectionAndHideProperties();
    for (const parentId of parentIds) {
      this.refreshContainerChain(parentId);
    }
    this.pushCommand(
      new DeleteSelectionCommand({
        nodeSnapshots: snapshots,
        edgeSnapshots,
        selectionBefore,
        removedNodeIds: [...removedIds],
        removedEdgeIds: [...edgeIds],
        parentIds: [...parentIds]
      })
    );
  }
  async createNodeWithHistory(nodeType, worldX, worldY, parentId = null) {
    var _a2;
    let parentType = null;
    if (parentId !== null) {
      parentType = ((_a2 = this.store.get(parentId)) == null ? void 0 : _a2.nodeType) ?? null;
    }
    const allowed = await this.events.dispatchBefore("before:nodeCreate", {
      nodeType,
      localX: worldX,
      localY: worldY,
      parentId,
      parentType
    });
    if (!allowed) return null;
    const selectionBefore = this.captureSelectionSnapshot();
    const label = nodeType === "group" ? `Group ${this.store.nextNodeId}` : nodeType === "hub" ? `Hub ${this.store.nextNodeId}` : `Node ${this.store.nextNodeId}`;
    const node = this.store.add(worldX, worldY, label, this.theme, nodeType);
    if (parentId !== null && !this.store.setParent(node.id, parentId)) {
      this.store.remove(node.id);
      return null;
    }
    if (parentId !== null) {
      this.refreshContainerChain(parentId);
    }
    const snapshot = this.captureNodeSnapshot(node);
    this.pushCommand(
      new CreateNodeCommand({
        snapshot,
        parentId,
        selectionBefore,
        selectOnRedo: false
      })
    );
    return node;
  }
  async handleAddNode(canvas, nodeType) {
    const screenX = Math.random() * (canvas.width - 200) + 100;
    const screenY = Math.random() * (canvas.height - 200) + 100;
    const { x, y } = this.camera.screenToWorld(screenX, screenY);
    await this.createNodeWithHistory(nodeType, x, y);
  }
  handleAddComposition(canvas) {
    const selectionBefore = this.captureSelectionSnapshot();
    const targetGroup = this.getSelectedGroupTarget();
    if (!targetGroup) return;
    const screenX = Math.random() * (canvas.width - 240) + 120;
    const screenY = Math.random() * (canvas.height - 240) + 120;
    const { x, y } = this.camera.screenToWorld(screenX, screenY);
    const composition = this.store.add(
      x,
      y,
      `Composition ${this.store.nextNodeId}`,
      this.theme,
      "composition"
    );
    if (!this.store.setParent(composition.id, targetGroup.id)) {
      this.store.remove(composition.id);
      return;
    }
    this.refreshContainerChain(targetGroup.id);
    const snapshot = this.captureNodeSnapshot(composition);
    this.clearSelectionState();
    this.setNodeSelected(composition.id, true);
    this.controls.hideProperties();
    this.pushCommand(
      new CreateNodeCommand({
        snapshot,
        parentId: snapshot.parentId,
        selectionBefore,
        selectOnRedo: true
      })
    );
  }
  createSubgraphFromSelection() {
    const roots = this.getSelectionDragRoots();
    if (roots.length === 0) return;
    const selectionBefore = this.captureSelectionSnapshot();
    const anchor = roots[0];
    const anchorWorld = getWorldPosition(anchor.id, this.store.allNodesMap);
    const subgraph = this.store.add(
      anchorWorld.x,
      anchorWorld.y,
      `Subgraph ${this.store.nextNodeId}`,
      this.theme,
      "subgraph"
    );
    const commonParent = roots.every(
      (root) => root.parentId === roots[0].parentId
    ) ? roots[0].parentId : null;
    if (commonParent !== null) {
      this.store.setParent(subgraph.id, commonParent);
    }
    const beforeSnapshots = this.captureNodeSnapshots(
      roots.map((root) => root.id)
    );
    const removedEdgeSnapshots = this.removeBoundaryEdgesForRoots(
      roots.map((root) => root.id)
    );
    for (const root of roots) {
      if (!this.store.setParent(root.id, subgraph.id)) continue;
    }
    this.store.syncNodePresentation(subgraph.id);
    this.store.updateContainerBounds(subgraph.id, this.theme);
    this.refreshContainerChain(subgraph.id);
    const afterSnapshots = this.captureNodeSnapshots(
      roots.map((root) => root.id)
    );
    const subgraphSnapshot = this.captureNodeSnapshot(subgraph);
    this.clearSelectionState();
    this.setNodeSelected(subgraph.id, true);
    this.syncPropertiesPanelForSelection();
    this.pushCommand(
      new CreateSubgraphCommand({
        subgraphSnapshot,
        childBeforeSnapshots: beforeSnapshots,
        childAfterSnapshots: afterSnapshots,
        removedEdgeSnapshots,
        selectionBefore
      })
    );
  }
  toggleSubgraphCollapse(subgraphId) {
    const node = this.store.get(subgraphId);
    if (!node || node.nodeType !== "subgraph") return;
    const beforeSnapshot = this.captureNodeSnapshot(node);
    node.isCollapsed = !node.isCollapsed;
    this.store.syncNodePresentation(node.id);
    this.store.updateContainerBounds(node.id, this.theme);
    this.refreshContainerChain(node.parentId);
    const afterSnapshot = this.captureNodeSnapshot(node);
    this.pushCommand(
      new ToggleSubgraphCollapseCommand({
        beforeSnapshot,
        afterSnapshot
      })
    );
    this.events.dispatch("subgraph:collapseToggle", {
      subgraphId: node.id,
      isCollapsed: node.isCollapsed
    });
    this.syncPropertiesPanelForSelection();
  }
  ungraphSubgraphWithHistory(subgraphId) {
    const subgraph = this.store.get(subgraphId);
    if (!subgraph || subgraph.nodeType !== "subgraph") return;
    const selectionBefore = this.captureSelectionSnapshot();
    const childIds = [...subgraph.childIds];
    const subgraphSnapshot = this.captureNodeSnapshot(subgraph);
    const childBeforeSnapshots = this.captureNodeSnapshots(childIds);
    const removedEdgeSnapshots = this.captureBoundaryEdgeSnapshots([
      subgraphId
    ]);
    this.store.removeContainerOnly(subgraphId);
    for (const snapshot of removedEdgeSnapshots) {
      const removed = this.edgeStore.remove(snapshot.id);
      if (removed) {
        this.syncHandleStates(removed.sourceNodeId);
        this.syncHandleStates(removed.targetNodeId);
      }
    }
    const childAfterSnapshots = this.captureNodeSnapshots(childIds);
    this.clearSelectionState();
    this.controls.hideProperties();
    this.refreshContainerChain(subgraph.parentId);
    this.pushCommand(
      new UngraphCommand({
        subgraphSnapshot,
        childBeforeSnapshots,
        childAfterSnapshots,
        removedEdgeSnapshots,
        selectionBefore
      })
    );
  }
  cloneSubgraphWithHistory(subgraphId) {
    const subgraph = this.store.get(subgraphId);
    if (!subgraph || subgraph.nodeType !== "subgraph") return;
    const selectionBefore = this.captureSelectionSnapshot();
    const parentId = subgraph.parentId;
    const world = getWorldPosition(subgraph.id, this.store.allNodesMap);
    const clone = this.store.add(
      world.x + 24,
      world.y + 24,
      `${subgraph.text} Copy`,
      this.theme,
      "subgraph"
    );
    if (parentId !== null) {
      this.store.setParent(clone.id, parentId);
    }
    clone.isCollapsed = subgraph.isCollapsed;
    this.store.updateContainerBounds(clone.id, this.theme);
    const snapshot = this.captureNodeSnapshot(clone);
    this.clearSelectionState();
    this.setNodeSelected(clone.id, true);
    this.syncPropertiesPanelForSelection();
    this.refreshContainerChain(clone.parentId);
    this.pushCommand(
      new CreateNodeCommand({
        snapshot,
        parentId,
        selectionBefore,
        selectOnRedo: true
      })
    );
  }
  async handleDeleteSelected() {
    await this.deleteCurrentSelectionWithHistory();
  }
  pick(screenX, screenY) {
    this.pickFBO.bind();
    this.renderer["gl"].clearColor(1, 1, 1, 1);
    this.renderer["gl"].clear(
      this.renderer["gl"].COLOR_BUFFER_BIT | this.renderer["gl"].DEPTH_BUFFER_BIT
    );
    this.renderer.drawNodes(true);
    const pixelX = Math.round(screenX * this.dpr);
    const pixelY = Math.round(screenY * this.dpr);
    const pixels = this.pickFBO.readPixel(pixelX, pixelY);
    this.pickFBO.unbind();
    if (pixels[0] === 255 && pixels[1] === 255 && pixels[2] === 255) {
      return 0;
    }
    return pixels[0] + (pixels[1] << 8) + (pixels[2] << 16);
  }
  hitTestHandle(screenX, screenY) {
    const visibleNodes = this.store.visibleNodes();
    for (let i = visibleNodes.length - 1; i >= 0; i--) {
      const node = visibleNodes[i];
      if (!isCandidateNodeType(node.nodeType, this.connectionMode, this.typeRegistry)) continue;
      if (node.handles.length === 0) continue;
      const { x, y } = getWorldPosition(node.id, this.store.allNodesMap);
      for (const handle of node.handles) {
        const geometry = getHandleScreenGeometry(
          x,
          y,
          node,
          handle,
          this.camera.zoom,
          this.camera.panX,
          this.camera.panY
        );
        if (isPointInsideHandle(screenX, screenY, geometry)) {
          return {
            nodeId: node.id,
            handle,
            geometry
          };
        }
      }
    }
    return null;
  }
  getHoveredContainer(screenX, screenY, source, hiddenNodeIds = [source.id]) {
    if (source.nodeType === "composition-child") return null;
    const pickedId = this.pickIgnoringNodeIds(screenX, screenY, hiddenNodeIds);
    if (pickedId === 0) return null;
    let pickedNode = this.store.get(pickedId);
    while (pickedNode) {
      if (pickedNode.id !== source.id && isContainerNodeType(pickedNode.nodeType)) {
        if (source.nodeType === "composition") {
          return pickedNode.nodeType === "group" || pickedNode.nodeType === "subgraph" ? pickedNode : null;
        }
        return pickedNode;
      }
      if (pickedNode.parentId === null) break;
      pickedNode = this.store.get(pickedNode.parentId);
    }
    return null;
  }
  syncToolbarState() {
    if (this.hasSelection()) {
      this.controls.enableDelete();
    } else {
      this.controls.disableDelete();
    }
    if (this.getSelectedGroupTarget()) {
      this.controls.enableAddComposition();
    } else {
      this.controls.disableAddComposition();
    }
    if (this.history.canUndo()) {
      this.controls.enableUndo();
    } else {
      this.controls.disableUndo();
    }
    if (this.history.canRedo()) {
      this.controls.enableRedo();
    } else {
      this.controls.disableRedo();
    }
    this.syncSelectionToolbar();
  }
  getSelectionToolbarButtons(node) {
    if (this.typeRegistry.has(node.nodeType)) {
      const isCollapsed = Boolean(node.isCollapsed);
      const actions = this.typeRegistry.getToolbarActions(node.nodeType, isCollapsed);
      return actions.filter((a) => TOOLBAR_ACTION_MAP[a]).map((a) => {
        const [glyph, label] = TOOLBAR_ACTION_MAP[a];
        return { action: a, glyph, label };
      });
    }
    if (node.nodeType === "subgraph") {
      return node.isCollapsed ? baseButtons([
        ["expand", `${EXPAND}`, "Expand"],
        ["clone", `${CLONE}`, "Clone"],
        ["edit", `${EDIT}`, "Edit"],
        ["delete", `${DELETE}`, "Delete"]
      ]) : baseButtons([
        ["collapse", `${COLLAPSE}`, "Collapse"],
        ["ungraph", `${UNGRAPH}`, "Ungraph"],
        ["clone", `${CLONE}`, "Clone"],
        ["edit", `${EDIT}`, "Edit"],
        ["delete", `${DELETE}`, "Delete"]
      ]);
    }
    if (node.nodeType === "node" || node.nodeType === "composition-child" || node.nodeType === "hub") {
      return baseButtons([
        ["edit", `${EDIT}`, "Edit"],
        ["delete", `${DELETE}`, "Delete"]
      ]);
    }
    if (node.nodeType === "group") {
      return baseButtons([
        ["spotlight", `${SPOTLIGHT}`, "Spotlight"],
        ["edit", `${EDIT}`, "Edit"],
        ["delete", `${DELETE}`, "Delete"]
      ]);
    }
    if (node.nodeType === "composition") {
      return baseButtons([["delete", `${DELETE}`, "Delete"]]);
    }
    return [];
  }
  syncSelectionToolbar() {
    if (!this.selectionToolbar) return;
    const node = this.getSingleSelectedNode();
    if (!node) {
      this.selectionToolbar.hide();
      this.selectionToolbarNodeId = null;
      this.selectionToolbarActionSignature = "";
      return;
    }
    const actions = this.getSelectionToolbarButtons(node);
    const signature = actions.map((action) => action.action).join("|");
    if (this.selectionToolbarNodeId !== node.id || this.selectionToolbarActionSignature !== signature) {
      this.selectionToolbar.setActions(actions);
      this.selectionToolbarNodeId = node.id;
      this.selectionToolbarActionSignature = signature;
    }
    this.updateSelectionToolbarPosition();
    this.selectionToolbar.show();
  }
  updateSelectionToolbarPosition() {
    if (!this.selectionToolbar) return;
    const node = this.getSingleSelectedNode();
    if (!node) return;
    const world = getWorldPosition(node.id, this.store.allNodesMap);
    const anchorX = world.x + node.width - 12;
    const anchorY = node.nodeType === "subgraph" ? node.isCollapsed ? world.y + node.height / 2 : world.y + 20 : isContainerNodeType(node.nodeType) ? world.y + 20 : world.y + NODE_LAYOUT.headerHeight / 2;
    const screen = this.camera.worldToScreen(anchorX, anchorY);
    const canvas = document.getElementById(this.canvasId);
    const rect = canvas.getBoundingClientRect();
    this.selectionToolbar.setPosition(screen.x + rect.left, screen.y + rect.top);
  }
  handleSelectionToolbarAction(action) {
    const node = this.getSingleSelectedNode();
    if (!node) return;
    switch (action) {
      case "delete":
        this.handleDeleteSelected();
        return;
      case "edit":
        this.beginLabelEdit(node);
        this.controls.showProperties(node);
        return;
      case "collapse":
      case "expand":
        if (node.nodeType === "subgraph") {
          this.toggleSubgraphCollapse(node.id);
        }
        return;
      case "ungraph":
        if (node.nodeType === "subgraph") {
          this.ungraphSubgraphWithHistory(node.id);
        }
        return;
      case "spotlight":
        if (node.nodeType !== "group") return;
        this.spotlightGroup(node.id);
        return;
      case "clone":
        if (node.nodeType === "subgraph") {
          this.cloneSubgraphWithHistory(node.id);
        }
        return;
    }
  }
  refreshContainerChain(containerId) {
    let currentId = containerId;
    while (currentId !== null) {
      const current = this.store.get(currentId);
      if (!current || !isContainerNodeType(current.nodeType)) return;
      this.store.updateContainerBounds(currentId, this.theme);
      if (current.nodeType === "composition") {
        this.refreshCompositionReferenceNodes(current.id);
      }
      currentId = current.parentId;
    }
  }
  refreshContainerChains(containerIds) {
    const visited = /* @__PURE__ */ new Set();
    for (const containerId of containerIds) {
      let currentId = containerId;
      while (currentId !== null && !visited.has(currentId)) {
        const current = this.store.get(currentId);
        if (!current || !isContainerNodeType(current.nodeType)) break;
        visited.add(currentId);
        this.store.updateContainerBounds(currentId, this.theme);
        if (current.nodeType === "composition") {
          this.refreshCompositionReferenceNodes(current.id);
        }
        currentId = current.parentId;
      }
    }
  }
  handlePointerDown(e, canvas) {
    if (e.pointerType !== "mouse") {
      e.preventDefault();
    }
    this.capturePointer(canvas, e);
    if (e.pointerType === "mouse") {
      this.handleMouseDown(e, canvas);
      return;
    }
    if (e.pointerType !== "touch") return;
    this.activeTouches.set(e.pointerId, e);
    if (this.activeTouches.size === 1) {
      this.handleMouseDown(e, canvas);
    }
    if (this.activeTouches.size === 2) {
      this.gestureMode = true;
      this.isPanning = false;
      this.draggingNode = null;
      this.activeConnectionDrag = null;
      const touches = [...this.activeTouches.values()];
      this.pinchDistance = this.distance(touches[0], touches[1]);
      const center = this.midpoint(touches[0], touches[1]);
      this.draggingNode = null;
      this.dragSnapshot = null;
      this.activeConnectionDrag = null;
      this.startPan(center.x, center.y);
    }
  }
  handleMouseDown(e, canvas) {
    if (e.button === 1 || e.button === 0 && e.altKey) {
      this.startPan(e.clientX, e.clientY);
      return;
    }
    const { left, top } = canvas.getBoundingClientRect();
    const screenX = e.clientX - left;
    const screenY = e.clientY - top;
    const handleHit = this.hitTestHandle(screenX, screenY);
    if (handleHit) {
      this.activeConnectionDrag = {
        sourceNodeId: handleHit.nodeId,
        sourceHandleSide: handleHit.handle.side,
        screenX,
        screenY
      };
      this.selectedEdgeIds.forEach((edgeId) => {
        const edge = this.edgeStore.get(edgeId);
        if (edge) edge.isSelected = false;
      });
      this.selectedEdgeIds.clear();
      this.selectionKind = this.selectedNodeIds.size > 0 ? "node" : null;
      this.hoveredHandle = handleHit;
      this.draggingNode = null;
      this.dragSnapshot = null;
      this.syncToolbarState();
      return;
    }
    const nodeId = this.pick(screenX, screenY);
    const node = this.store.get(nodeId);
    if (!node) {
      const edgeHit = this.hitTestEdge(screenX, screenY);
      if (edgeHit) {
        this.controls.hideProperties();
        this.selectEdgeByClick(edgeHit.id);
        this.events.dispatch("edge:click", {
          edgeId: edgeHit.id,
          event: e
        });
        this.hoveredHandle = null;
        this.draggingNode = null;
        this.dragSnapshot = null;
        this.syncToolbarState();
        return;
      }
      this.clearSelectionAndHideProperties();
      this.draggingNode = null;
      this.dragSnapshot = null;
      this.events.dispatch("pane:click", { event: e });
      this.hoveredHandle = null;
      this.syncToolbarState();
      this.startPan(e.clientX, e.clientY);
      return;
    }
    const { x: worldX, y: worldY } = this.camera.screenToWorld(
      screenX,
      screenY
    );
    const nodeWorld = getWorldPosition(node.id, this.store.allNodesMap);
    const localClickX = worldX - nodeWorld.x;
    const localClickY = worldY - nodeWorld.y;
    if (node.nodeType === "subgraph") {
      const edgeHit = this.hitTestEdge(screenX, screenY);
      if (edgeHit) {
        this.controls.hideProperties();
        this.selectEdgeByClick(edgeHit.id);
        this.hoveredHandle = null;
        this.draggingNode = null;
        this.dragSnapshot = null;
        this.syncToolbarState();
        return;
      }
    }
    if (node.nodeType === "group") {
      const lockX = node.width / 2;
      const lockY = NODE_LAYOUT.lockBtnTopY;
      const lockDx = localClickX - lockX;
      const lockDy = localClickY - lockY;
      if (lockDx * lockDx + lockDy * lockDy <= NODE_LAYOUT.lockBtnClickRadius * NODE_LAYOUT.lockBtnClickRadius) {
        const beforeSnapshot = this.captureNodeSnapshot(node);
        node.isLocked = !node.isLocked;
        const afterSnapshot = this.captureNodeSnapshot(node);
        this.pushCommand(
          new ToggleLockCommand({
            beforeSnapshot,
            afterSnapshot
          })
        );
        this.hoveredHandle = null;
        return;
      }
    }
    if (node.nodeType === "group") {
      const plusX = node.width / 2;
      const plusY = node.height - NODE_LAYOUT.plusBtnPaddingBottom;
      const plusDx = localClickX - plusX;
      const plusDy = localClickY - plusY;
      if (plusDx * plusDx + plusDy * plusDy <= NODE_LAYOUT.plusBtnClickRadius * NODE_LAYOUT.plusBtnClickRadius) {
        this.createNodeWithHistory("node", 0, 0, node.id).catch(console.error);
        this.hoveredHandle = null;
        this.syncToolbarState();
        return;
      }
    }
    const canDragSelection = this.isMultiSelectMode && this.selectionKind === "node" && this.selectedNodeIds.size > 1 && this.selectedNodeIds.has(node.id) && !this.isInLockedGroup(node.id) && !(node.nodeType === "subgraph" && !node.isCollapsed);
    if (canDragSelection) {
      this.controls.hideProperties();
      this.draggingNode = null;
      this.dragSnapshot = null;
      this.startSelectionDrag(worldX, worldY, node);
      if (this.draggingSelection) {
        this.events.dispatch("node:dragStart", {
          nodeIds: this.draggingSelection.entries.map((en) => en.nodeId),
          event: e
        });
      }
      this.hoveredHandle = null;
      this.syncToolbarState();
      return;
    }
    this.controls.hideProperties();
    this.selectNodeByClick(node.id);
    this.events.dispatch("node:click", {
      nodeId: node.id,
      nodeType: node.nodeType,
      event: e
    });
    this.hoveredHandle = null;
    if (this.isInLockedGroup(node.id)) {
      this.draggingNode = null;
      this.dragSnapshot = null;
      this.syncToolbarState();
      return;
    }
    if (node.nodeType === "subgraph" && !node.isCollapsed) {
      this.draggingNode = null;
      this.dragSnapshot = null;
      this.syncToolbarState();
      return;
    }
    this.draggingNode = node;
    this.dragSnapshot = {
      localX: node.localX,
      localY: node.localY,
      parentId: node.parentId,
      subtreeSnapshots: node.nodeType === "subgraph" && node.isCollapsed ? this.captureSubtreeSnapshots(node.id) : void 0
    };
    this.dragOffsetX = worldX - nodeWorld.x;
    this.dragOffsetY = worldY - nodeWorld.y;
    this.events.dispatch("node:dragStart", {
      nodeIds: [node.id],
      event: e
    });
    this.syncToolbarState();
  }
  startPan(clientX, clientY) {
    this.isPanning = true;
    this.lastMouseX = clientX;
    this.lastMouseY = clientY;
    this.cameraDirty = true;
  }
  handlePointerMove(e, canvas) {
    if (e.pointerType !== "mouse") {
      e.preventDefault();
    }
    if (e.pointerType === "mouse") {
      this.handleMouseMove(e, canvas);
      return;
    }
    if (e.pointerType !== "touch") return;
    this.activeTouches.set(e.pointerId, e);
    if (!this.gestureMode) {
      if (this.activeTouches.size === 1) {
        this.handleMouseMove(e, canvas);
        return;
      }
    } else {
      if (this.activeTouches.size === 2) {
        const touches = [...this.activeTouches.values()];
        const center = this.midpoint(touches[0], touches[1]);
        this.camera.pan(center.x - this.lastMouseX, center.y - this.lastMouseY);
        this.lastMouseX = center.x;
        this.lastMouseY = center.y;
        const distance = this.distance(touches[0], touches[1]);
        if (this.pinchDistance !== null) {
          const delta = this.pinchDistance - distance;
          const rect = canvas.getBoundingClientRect();
          this.camera.zoomAt(center.x - rect.left, center.y - rect.top, delta);
          this.triggerZoomThrottle();
        }
        this.pinchDistance = distance;
      }
    }
  }
  handleMouseMove(e, canvas) {
    if (this.isPanning) {
      this.camera.pan(e.clientX - this.lastMouseX, e.clientY - this.lastMouseY);
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      return;
    }
    const { left, top } = canvas.getBoundingClientRect();
    const screenX = e.clientX - left;
    const screenY = e.clientY - top;
    const { x: worldX, y: worldY } = this.camera.screenToWorld(
      screenX,
      screenY
    );
    if (this.activeConnectionDrag) {
      this.activeConnectionDrag.screenX = screenX;
      this.activeConnectionDrag.screenY = screenY;
      this.hoveredHandle = this.hitTestHandle(screenX, screenY);
      return;
    }
    if (this.draggingSelection) {
      this.moveSelectionDrag(worldX, worldY, screenX, screenY);
      this.events.dispatch("node:drag", {
        nodeIds: this.draggingSelection.entries.map((e2) => e2.nodeId),
        event: e
      });
      return;
    }
    if (!this.draggingNode) return;
    const targetX = worldX - this.dragOffsetX;
    const targetY = worldY - this.dragOffsetY;
    const previousLocalX = this.draggingNode.localX;
    const previousLocalY = this.draggingNode.localY;
    if (this.draggingNode.parentId === null) {
      this.draggingNode.localX = targetX;
      this.draggingNode.localY = targetY;
    } else {
      const parentWorld = getParentFrameWorldPosition(
        this.draggingNode.parentId,
        this.store.allNodesMap
      );
      this.draggingNode.localX = targetX - parentWorld.x;
      this.draggingNode.localY = targetY - parentWorld.y;
    }
    if (this.draggingNode.nodeType === "subgraph" && this.draggingNode.isCollapsed) {
      const deltaX = this.draggingNode.localX - previousLocalX;
      const deltaY = this.draggingNode.localY - previousLocalY;
      this.store.translateDescendants(this.draggingNode.id, deltaX, deltaY);
    }
    const refreshContainerId = this.draggingNode.nodeType === "subgraph" ? this.draggingNode.id : this.getOwningSubgraphId(this.draggingNode.id);
    if (refreshContainerId !== null) {
      this.refreshContainerChain(refreshContainerId);
    }
    this.store.clearDropTargets();
    if (isNodePrimitiveType(this.draggingNode.nodeType) || this.draggingNode.nodeType === "composition") {
      const hoveredContainer = this.getHoveredContainer(
        screenX,
        screenY,
        this.draggingNode
      );
      if (hoveredContainer) {
        hoveredContainer.isDropTarget = true;
      }
    }
    this.events.dispatch("node:drag", {
      nodeIds: [this.draggingNode.id],
      event: e
    });
  }
  async handlePointerUp(e, canvas) {
    if (e.pointerType === "mouse") {
      await this.handleMouseUp(e, canvas);
      this.releasePointer(canvas, e);
      return;
    }
    this.activeTouches.delete(e.pointerId);
    if (this.gestureMode && this.activeTouches.size < 2) {
      this.gestureMode = false;
      this.pinchDistance = null;
      this.isPanning = false;
      this.cameraDirty = false;
    }
    if (this.activeTouches.size === 0) {
      await this.handleMouseUp(e, canvas);
    }
    this.releasePointer(canvas, e);
  }
  handlePointerCancel(e, canvas) {
    this.handlePointerUp(e, canvas);
  }
  capturePointer(canvas, e) {
    if (!canvas.setPointerCapture) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
    }
  }
  releasePointer(canvas, e) {
    var _a2;
    if (!((_a2 = canvas.hasPointerCapture) == null ? void 0 : _a2.call(canvas, e.pointerId))) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
    }
  }
  async handleMouseUp(e, canvas) {
    this.isPanning = false;
    this.cameraDirty = false;
    if (this.activeConnectionDrag) {
      const source = this.activeConnectionDrag;
      const target = this.hoveredHandle;
      if (target) {
        if (this.isValidConnection(
          source.sourceNodeId,
          source.sourceHandleSide,
          target.nodeId,
          target.handle.side
        )) {
          const sourceNode = this.store.get(source.sourceNodeId);
          const targetNode = this.store.get(target.nodeId);
          if (!sourceNode || !targetNode) return;
          const allowed = await this.events.dispatchBefore("before:connect", {
            sourceId: source.sourceNodeId,
            sourceType: sourceNode.nodeType,
            targetId: target.nodeId,
            targetType: targetNode.nodeType
          });
          if (!allowed) {
            this.activeConnectionDrag = null;
            this.hoveredHandle = null;
            this.syncToolbarState();
            return;
          }
          const edge = this.edgeStore.add({
            sourceNodeId: source.sourceNodeId,
            sourceHandleSide: source.sourceHandleSide,
            targetNodeId: target.nodeId,
            targetHandleSide: target.handle.side,
            sourceCanHaveMultipleConnections: sourceNode.nodeType === "hub",
            targetCanHaveMultipleConnections: targetNode.nodeType === "hub"
          });
          if (edge) {
            this.syncHandleStates(edge.sourceNodeId);
            this.syncHandleStates(edge.targetNodeId);
            this.applyCompositionReferenceForEdge(edge);
            const snapshot = { ...edge };
            this.pushCommand(
              new ConnectCommand({
                edgeSnapshot: snapshot
              })
            );
            this.events.dispatch("connect", {
              sourceId: source.sourceNodeId,
              sourceType: sourceNode.nodeType,
              targetId: target.nodeId,
              targetType: targetNode.nodeType,
              edgeId: edge.id
            });
          }
        }
      } else {
        this.createHubFromConnectionDrop(source, canvas, e.clientX, e.clientY);
      }
      this.activeConnectionDrag = null;
      this.hoveredHandle = null;
      this.syncToolbarState();
      return;
    }
    if (this.draggingSelection) {
      const { left, top } = canvas.getBoundingClientRect();
      const screenX = e.clientX - left;
      const screenY = e.clientY - top;
      const selectionDrag = this.draggingSelection;
      const selectionBefore = this.captureSelectionSnapshot();
      const hoveredContainer = this.inferSelectionDropTarget(
        screenX,
        screenY,
        selectionDrag
      );
      const dropResult = await this.applySelectionDrop(
        selectionDrag,
        hoveredContainer
      );
      const draggedNodeIds = [];
      if (this.draggingSelection) {
        draggedNodeIds.push(
          ...this.draggingSelection.entries.map((e2) => e2.nodeId)
        );
      } else if (this.draggingNode) {
        draggedNodeIds.push(this.draggingNode.id);
      }
      if (draggedNodeIds.length > 0) {
        this.events.dispatch("node:dragStop", {
          nodeIds: draggedNodeIds,
          event: e
        });
      }
      this.draggingSelection = null;
      this.draggingNode = null;
      this.dragSnapshot = null;
      this.selectionRep = null;
      this.store.clearDropTargets();
      if (dropResult.didChange) {
        this.pushCommand(
          new MoveSelectionCommand({
            beforeSnapshots: dropResult.beforeSnapshots,
            afterSnapshots: dropResult.afterSnapshots,
            cloneSnapshots: dropResult.cloneSnapshots,
            removedReferenceEdgeSnapshots: dropResult.removedReferenceEdgeSnapshots,
            selectionBefore,
            affectedParentIds: dropResult.affectedParentIds
          })
        );
      }
      this.syncToolbarState();
      return;
    }
    if (this.draggingNode && this.dragSnapshot) {
      const { left, top } = canvas.getBoundingClientRect();
      const screenX = e.clientX - left;
      const screenY = e.clientY - top;
      const source = this.draggingNode;
      const snapshot = this.dragSnapshot;
      const selectionBefore = this.captureSelectionSnapshot();
      const sourceId = source.id;
      let command = null;
      const sourceOwningSubgraphId = this.getOwningSubgraphId(source.id);
      if (isNodePrimitiveType(source.nodeType)) {
        const hoveredContainer = this.getHoveredContainer(
          screenX,
          screenY,
          source
        );
        const beforePlacement = {
          localX: snapshot.localX,
          localY: snapshot.localY,
          parentId: snapshot.parentId
        };
        let removedReferenceEdgeSnapshots = [];
        const canEnterHoveredContainer = hoveredContainer !== null && this.canEnterContainer(sourceOwningSubgraphId, hoveredContainer);
        if ((hoveredContainer == null ? void 0 : hoveredContainer.nodeType) === "composition" && canEnterHoveredContainer) {
          const clone = this.store.duplicateIntoComposition(
            source.id,
            hoveredContainer.id,
            this.theme
          );
          this.store.restoreNodePlacement(
            source.id,
            snapshot.localX,
            snapshot.localY,
            snapshot.parentId
          );
          if (clone) {
            const cloneSnapshot = this.captureNodeSnapshot(clone);
            this.clearSelectionState();
            this.setNodeSelected(clone.id, true);
            this.refreshContainerChain(hoveredContainer.id);
            command = new DuplicateIntoCompositionCommand({
              sourceId,
              sourcePlacement: {
                localX: snapshot.localX,
                localY: snapshot.localY,
                parentId: snapshot.parentId
              },
              cloneSnapshot,
              compositionId: hoveredContainer.id,
              selectionBefore
            });
          }
        } else if ((hoveredContainer == null ? void 0 : hoveredContainer.nodeType) === "group" && canEnterHoveredContainer) {
          const parentChanged = source.parentId !== hoveredContainer.id;
          if (!parentChanged || this.store.setParent(source.id, hoveredContainer.id)) {
            const afterPlacement = {
              localX: source.localX,
              localY: source.localY,
              parentId: source.parentId
            };
            this.refreshContainerChain(hoveredContainer.id);
            const oldParentId = beforePlacement.parentId;
            if (oldParentId !== null && oldParentId !== hoveredContainer.id) {
              this.refreshContainerChain(oldParentId);
            }
            if (beforePlacement.localX !== afterPlacement.localX || beforePlacement.localY !== afterPlacement.localY || beforePlacement.parentId !== afterPlacement.parentId) {
              command = new ReparentCommand({
                nodeId: sourceId,
                beforePlacement,
                afterPlacement,
                selectionBefore,
                removedReferenceEdgeSnapshots,
                extraRefreshIds: []
              });
            }
          }
        } else {
          if (sourceOwningSubgraphId === null) {
            if (this.store.setParent(source.id, null)) {
              removedReferenceEdgeSnapshots = this.removeCompositionReferenceEdgesForNode(source.id);
              const afterPlacement = {
                localX: source.localX,
                localY: source.localY,
                parentId: source.parentId
              };
              const oldParentId = beforePlacement.parentId;
              if (oldParentId !== null) {
                this.refreshContainerChain(oldParentId);
              }
              if (beforePlacement.localX !== afterPlacement.localX || beforePlacement.localY !== afterPlacement.localY || beforePlacement.parentId !== afterPlacement.parentId) {
                command = new ReparentCommand({
                  nodeId: sourceId,
                  beforePlacement,
                  afterPlacement,
                  selectionBefore,
                  removedReferenceEdgeSnapshots,
                  extraRefreshIds: []
                });
              }
            } else {
              this.store.restoreNodePlacement(
                source.id,
                snapshot.localX,
                snapshot.localY,
                snapshot.parentId
              );
            }
          }
        }
        if (command === null && (beforePlacement.localX !== source.localX || beforePlacement.localY !== source.localY || beforePlacement.parentId !== source.parentId)) {
          command = new ReparentCommand({
            nodeId: sourceId,
            beforePlacement,
            afterPlacement: {
              localX: source.localX,
              localY: source.localY,
              parentId: source.parentId
            },
            selectionBefore,
            removedReferenceEdgeSnapshots: [],
            extraRefreshIds: []
          });
        }
      } else if (source.nodeType === "subgraph" && source.isCollapsed) {
        const beforePlacement = {
          localX: snapshot.localX,
          localY: snapshot.localY,
          parentId: snapshot.parentId
        };
        const afterPlacement = {
          localX: source.localX,
          localY: source.localY,
          parentId: source.parentId
        };
        if (beforePlacement.localX !== afterPlacement.localX || beforePlacement.localY !== afterPlacement.localY) {
          command = new MoveSelectionCommand({
            beforeSnapshots: snapshot.subtreeSnapshots ?? this.captureSubtreeSnapshots(source.id),
            afterSnapshots: this.captureSubtreeSnapshots(source.id),
            cloneSnapshots: [],
            removedReferenceEdgeSnapshots: [],
            selectionBefore,
            affectedParentIds: [source.id, source.parentId]
          });
        }
      } else if (source.nodeType === "composition") {
        const hoveredContainer = this.getHoveredContainer(
          screenX,
          screenY,
          source
        );
        const canEnterHoveredContainer = hoveredContainer !== null && this.canEnterContainer(sourceOwningSubgraphId, hoveredContainer);
        if (((hoveredContainer == null ? void 0 : hoveredContainer.nodeType) === "group" || (hoveredContainer == null ? void 0 : hoveredContainer.nodeType) === "subgraph") && canEnterHoveredContainer) {
          const beforePlacement = {
            localX: snapshot.localX,
            localY: snapshot.localY,
            parentId: snapshot.parentId
          };
          if (this.store.setParent(source.id, hoveredContainer.id)) {
            const removedReferenceEdgeSnapshots = hoveredContainer.nodeType === "subgraph" ? this.removeBoundaryEdgesForRoots([source.id]) : [];
            const afterPlacement = {
              localX: source.localX,
              localY: source.localY,
              parentId: source.parentId
            };
            this.refreshContainerChain(source.id);
            const oldParentId = beforePlacement.parentId;
            if (oldParentId !== null && oldParentId !== hoveredContainer.id) {
              this.refreshContainerChain(oldParentId);
            }
            if (beforePlacement.localX !== afterPlacement.localX || beforePlacement.localY !== afterPlacement.localY || beforePlacement.parentId !== afterPlacement.parentId) {
              command = new ReparentCommand({
                nodeId: sourceId,
                beforePlacement,
                afterPlacement,
                selectionBefore,
                removedReferenceEdgeSnapshots,
                extraRefreshIds: [sourceId]
              });
            }
          } else {
            this.store.restoreNodePlacement(
              source.id,
              snapshot.localX,
              snapshot.localY,
              snapshot.parentId
            );
            this.refreshContainerChain(source.id);
          }
        } else {
          this.store.restoreNodePlacement(
            source.id,
            snapshot.localX,
            snapshot.localY,
            snapshot.parentId
          );
          this.refreshContainerChain(source.id);
        }
      } else if (source.nodeType === "group") {
        const beforePlacement = {
          localX: snapshot.localX,
          localY: snapshot.localY,
          parentId: snapshot.parentId
        };
        const hoveredContainer = this.getHoveredContainer(
          screenX,
          screenY,
          source
        );
        const canEnterHoveredContainer = hoveredContainer !== null && this.canEnterContainer(sourceOwningSubgraphId, hoveredContainer);
        if ((hoveredContainer == null ? void 0 : hoveredContainer.nodeType) === "subgraph") {
          if (canEnterHoveredContainer) {
            if (this.store.setParent(source.id, hoveredContainer.id)) {
              const afterPlacement = {
                localX: source.localX,
                localY: source.localY,
                parentId: source.parentId
              };
              this.refreshContainerChain(hoveredContainer.id);
              const oldParentId = beforePlacement.parentId;
              if (oldParentId !== null && oldParentId !== hoveredContainer.id) {
                this.refreshContainerChain(oldParentId);
              }
              if (beforePlacement.localX !== afterPlacement.localX || beforePlacement.localY !== afterPlacement.localY || beforePlacement.parentId !== afterPlacement.parentId) {
                command = new ReparentCommand({
                  nodeId: sourceId,
                  beforePlacement,
                  afterPlacement,
                  selectionBefore,
                  removedReferenceEdgeSnapshots: [],
                  extraRefreshIds: []
                });
              }
            } else {
              this.store.restoreNodePlacement(
                source.id,
                snapshot.localX,
                snapshot.localY,
                snapshot.parentId
              );
            }
          }
        } else {
          const afterPlacement = {
            localX: source.localX,
            localY: source.localY,
            parentId: source.parentId
          };
          if (beforePlacement.localX !== afterPlacement.localX || beforePlacement.localY !== afterPlacement.localY) {
            command = new MoveNodeCommand({
              nodeId: sourceId,
              beforePlacement,
              afterPlacement,
              selectionBefore
            });
          }
        }
      }
      if (command) {
        this.pushCommand(command);
      }
    }
    if (this.draggingNode) {
      this.events.dispatch("node:dragStop", {
        nodeIds: [this.draggingNode.id],
        event: e
      });
    }
    this.store.clearDropTargets();
    this.draggingNode = null;
    this.dragSnapshot = null;
    this.syncToolbarState();
  }
  createHubFromConnectionDrop(source, canvas, clientX, clientY) {
    const sourceNode = this.store.get(source.sourceNodeId);
    if ((sourceNode == null ? void 0 : sourceNode.nodeType) === "composition" || (sourceNode == null ? void 0 : sourceNode.nodeType) === "branch") {
      return false;
    }
    const { left, top } = canvas.getBoundingClientRect();
    const screenX = clientX - left;
    const screenY = clientY - top;
    const pickedId = this.pick(screenX, screenY);
    const dropTarget = pickedId === 0 ? null : this.store.get(pickedId);
    if (dropTarget && dropTarget.nodeType !== "subgraph") {
      return false;
    }
    const { x: worldX, y: worldY } = this.camera.screenToWorld(
      screenX,
      screenY
    );
    const selectionBefore = this.captureSelectionSnapshot();
    const parentId = (dropTarget == null ? void 0 : dropTarget.nodeType) === "subgraph" ? dropTarget.id : null;
    const hub = this.store.add(
      worldX,
      worldY,
      `Hub ${this.store.nextNodeId}`,
      this.theme,
      "hub"
    );
    if (parentId !== null && !this.store.setParent(hub.id, parentId)) {
      this.store.remove(hub.id);
      return false;
    }
    const edgeParams = source.sourceHandleSide === "right" ? {
      sourceNodeId: source.sourceNodeId,
      sourceHandleSide: source.sourceHandleSide,
      targetNodeId: hub.id,
      targetHandleSide: "left",
      sourceCanHaveMultipleConnections: (sourceNode == null ? void 0 : sourceNode.nodeType) === "hub",
      targetCanHaveMultipleConnections: true
    } : {
      sourceNodeId: hub.id,
      sourceHandleSide: "right",
      targetNodeId: source.sourceNodeId,
      targetHandleSide: source.sourceHandleSide,
      sourceCanHaveMultipleConnections: true,
      targetCanHaveMultipleConnections: (sourceNode == null ? void 0 : sourceNode.nodeType) === "hub"
    };
    if (!this.isValidConnection(
      edgeParams.sourceNodeId,
      edgeParams.sourceHandleSide,
      edgeParams.targetNodeId,
      edgeParams.targetHandleSide
    )) {
      this.store.remove(hub.id);
      return false;
    }
    const edge = this.edgeStore.add(edgeParams);
    if (!edge) {
      this.store.remove(hub.id);
      return false;
    }
    this.syncHandleStates(edge.sourceNodeId);
    this.syncHandleStates(edge.targetNodeId);
    this.applyCompositionReferenceForEdge(edge);
    const hubSnapshot = this.captureNodeSnapshot(hub);
    const edgeSnapshot = { ...edge };
    this.clearSelectionState();
    this.setNodeSelected(hub.id, true);
    this.refreshContainerChain(parentId);
    this.pushCommand(
      new CreateHubFromConnectionDropCommand({
        hubSnapshot,
        edgeSnapshot,
        selectionBefore,
        parentId
      })
    );
    this.events.dispatch("hub:created", {
      hubId: hub.id
    });
    return true;
  }
  isValidConnection(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide) {
    if (sourceNodeId === targetNodeId) return false;
    const sourceNode = this.store.get(sourceNodeId);
    const targetNode = this.store.get(targetNodeId);
    if (!sourceNode || !targetNode) return false;
    if (this.typeRegistry.has(sourceNode.nodeType) && this.typeRegistry.has(targetNode.nodeType)) {
      if (!this.typeRegistry.isValidConnectionSide(sourceNode.nodeType, sourceHandleSide, "source")) {
        return false;
      }
      if (!this.typeRegistry.isValidConnectionSide(targetNode.nodeType, targetHandleSide, "target")) {
        return false;
      }
      const sourceOwningSubgraphId2 = this.getOutermostSubgraphId(sourceNodeId);
      const targetOwningSubgraphId2 = this.getOutermostSubgraphId(targetNodeId);
      if (sourceOwningSubgraphId2 !== targetOwningSubgraphId2) {
        return false;
      }
      if (sourceNode.nodeType === "node" && targetNode.nodeType === "composition" && !this.canCreateCompositionReference(sourceNodeId, targetNodeId)) {
        return false;
      }
      if (!this.typeRegistry.allowsMultiConnect(sourceNode.nodeType) && this.edgeStore.hasConnection(sourceNodeId, sourceHandleSide)) return false;
      if (!this.typeRegistry.allowsMultiConnect(targetNode.nodeType) && this.edgeStore.hasConnection(targetNodeId, targetHandleSide)) return false;
      return true;
    }
    if (sourceNode.nodeType === "subgraph" && sourceHandleSide !== "right") {
      return false;
    }
    if (targetNode.nodeType === "subgraph" && targetHandleSide !== "left") {
      return false;
    }
    if (sourceNode.nodeType === "hub" && sourceHandleSide !== "right") {
      return false;
    }
    if (targetNode.nodeType === "hub" && targetHandleSide !== "left") {
      return false;
    }
    const sourceOwningSubgraphId = this.getOutermostSubgraphId(sourceNodeId);
    const targetOwningSubgraphId = this.getOutermostSubgraphId(targetNodeId);
    if (sourceOwningSubgraphId !== targetOwningSubgraphId) {
      return false;
    }
    if (sourceNode.nodeType === "node" && targetNode.nodeType === "composition" && !this.canCreateCompositionReference(sourceNodeId, targetNodeId)) {
      return false;
    }
    if (sourceNode.nodeType !== "hub" && this.edgeStore.hasConnection(sourceNodeId, sourceHandleSide))
      return false;
    if (targetNode.nodeType !== "hub" && this.edgeStore.hasConnection(targetNodeId, targetHandleSide))
      return false;
    return true;
  }
  hitTestEdge(screenX, screenY) {
    const edges = this.edgeStore.allEdges().filter((edge) => edge.visible);
    for (let i = edges.length - 1; i >= 0; i--) {
      const geometry = buildEdgeRouteGeometry(
        edges[i],
        this.store,
        this.camera
      );
      if (!geometry) continue;
      const sourceNode = this.store.get(edges[i].sourceNodeId);
      const targetNode = this.store.get(edges[i].targetNodeId);
      if (!sourceNode || !targetNode || !this.store.isEffectivelyVisible(sourceNode.id) || !this.store.isEffectivelyVisible(targetNode.id)) {
        continue;
      }
      if (hitTestEdgePolyline(screenX, screenY, geometry.screenPoints)) {
        return { id: edges[i].id };
      }
    }
    return null;
  }
  removeNodesAndEdges(nodeIds, edgeIds) {
    const removedNodeIds = /* @__PURE__ */ new Set();
    for (const nodeId of nodeIds) {
      for (const removedId of this.store.collectRemovedIds(nodeId)) {
        removedNodeIds.add(removedId);
      }
    }
    const removedIdSet = new Set(removedNodeIds);
    const removedEdges = this.edgeStore.removeEdgesForNodes(removedNodeIds);
    const affectedNodeIds = /* @__PURE__ */ new Set();
    const selectedEdgeIdSet = new Set(edgeIds);
    for (const edgeId of selectedEdgeIdSet) {
      const removed = this.edgeStore.remove(edgeId);
      if (removed) {
        removedEdges.push(removed);
      }
    }
    for (const edge of removedEdges) {
      if (!removedIdSet.has(edge.sourceNodeId)) {
        this.clearCompositionReferenceForEdge(edge);
      }
      if (!removedIdSet.has(edge.sourceNodeId)) {
        affectedNodeIds.add(edge.sourceNodeId);
      }
      if (!removedIdSet.has(edge.targetNodeId)) {
        affectedNodeIds.add(edge.targetNodeId);
      }
    }
    for (const nodeId of removedNodeIds) {
      this.store.remove(nodeId);
    }
    for (const affectedNodeId of affectedNodeIds) {
      this.syncHandleStates(affectedNodeId);
    }
  }
  removeContainerOnly(nodeId) {
    this.store.removeContainerOnly(nodeId);
  }
  removeNodeAndIncidentEdges(nodeId) {
    this.removeNodesAndEdges([nodeId], []);
  }
  syncHandleStates(nodeId) {
    this.store.updateHandleConnectionState(
      nodeId,
      "left",
      this.edgeStore.hasConnection(nodeId, "left")
    );
    this.store.updateHandleConnectionState(
      nodeId,
      "right",
      this.edgeStore.hasConnection(nodeId, "right")
    );
  }
  hasSelection() {
    return this.selectedNodeIds.size > 0 || this.selectedEdgeIds.size > 0;
  }
  triggerZoomThrottle() {
    this.renderer.isZooming = true;
    this.cameraDirty = true;
    if (this.zoomThrottleTimer) {
      clearTimeout(this.zoomThrottleTimer);
    }
    this.zoomThrottleTimer = setTimeout(() => {
      this.cameraDirty = false;
      this.renderer.isZooming = false;
      this.zoomThrottleTimer = null;
    }, this.ZOOM_THROTTLE_MS);
  }
  handleWheel(e, canvas) {
    e.preventDefault();
    const { left, top } = canvas.getBoundingClientRect();
    this.camera.zoomAt(e.clientX - left, e.clientY - top, e.deltaY);
    this.triggerZoomThrottle();
  }
  handleKeyDown(e) {
    const target = e.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target == null ? void 0 : target.isContentEditable)) {
      return;
    }
    const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey;
    const isRedo = (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || e.key.toLowerCase() === "z" && e.shiftKey);
    if (isUndo) {
      e.preventDefault();
      this.undo();
      return;
    }
    if (isRedo) {
      e.preventDefault();
      this.redo();
      return;
    }
  }
  handleSubgraphCreation() {
    if (this.selectedNodeIds.size > 0 && this.selectedEdgeIds.size === 0) {
      this.createSubgraphFromSelection();
    }
  }
};
__publicField(_NodeEditor, "_instance", null);
let NodeEditor = _NodeEditor;
const vertexShader = `#version 300 es

in vec4 a_Position;
in vec2 a_TexCoord;
in float a_Z;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
out vec2 v_TexCoord;
void main() {
  vec4 pos = u_ModelMatrix * a_Position;
  pos.z = a_Z;
  gl_Position = u_ProjMatrix * u_ViewMatrix * pos;
  v_TexCoord = a_TexCoord;
}`;
const fragmentShader = `#version 300 es

precision mediump float;
in vec2 v_TexCoord;
uniform sampler2D u_Sampler;
uniform bool u_UseTexture;
uniform vec4 u_Color;
uniform int u_RenderMode;
uniform vec4 u_BorderColor;
uniform float u_BorderWidth;
uniform float u_Radius;
out vec4 fragColor;

// 9-slice scaling uniforms
uniform bool u_Use9Slice;
uniform vec2 u_Dimensions;
uniform vec2 u_TextureSize;
uniform vec4 u_SliceMargins; // x=left, y=top, z=right, w=bottom

vec2 map9SliceCoord(vec2 uv, vec2 size, vec2 texSize, vec4 margins) {
  vec2 pixelPos = uv * size;
  float x = 0.0;

  if (pixelPos.x < margins.x) {
    x = pixelPos.x;
  } else if (pixelPos.x > size.x - margins.z) {
    x = texSize.x - (size.x - pixelPos.x);
  } else {
    float innerQuadWidth = size.x - margins.x - margins.z;
    float innerTexWidth = texSize.x - margins.x - margins.z;
    float ratio = (pixelPos.x - margins.x) / innerQuadWidth;
    x = margins.x + ratio * innerTexWidth;
  }

  float y = 0.0;
  if (pixelPos.y < margins.y) {
    y = pixelPos.y;
  } else if (pixelPos.y > size.y - margins.w) {
    y = texSize.y - (size.y - pixelPos.y);
  } else {
    float innerQuadHeight = size.y - margins.y - margins.w;
    float innerTexHeight = texSize.y - margins.y - margins.w;
    float ratio = (pixelPos.y - margins.y) / innerQuadHeight;
    y = margins.y + ratio * innerTexHeight;
  }

  return vec2(x / texSize.x, y / texSize.y);
}

float roundedBoxDistance(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + vec2(radius);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

// SDF for an equilateral triangle pointing UPWARD, centered at origin.
// Uses padX and padY accounting for corner rounding expansion (r / sin(theta/2))
// so the outer border and rounded corners never get clipped/cropped by the quad bounding box.
float roundedTriangleDistance(vec2 p, vec2 halfSize, float radius, float borderWidth) {
  float padY = radius * 2.2 + borderWidth + 4.0;
  float padX = radius * 1.5 + borderWidth + 4.0;
  vec2 innerHalf = max(halfSize - vec2(padX, padY), vec2(1.0));
  float w = innerHalf.x;
  float h = innerHalf.y;

  vec2 q = vec2(abs(p.x), p.y);
  // Sloped edge from (0, -h) to (w, h)
  // Normal pointing outward (towards positive x, positive y): (2h, -w) / sqrt(4h^2 + w^2)
  float len = length(vec2(2.0 * h, w));
  float edgeDist = (q.x * 2.0 * h - (q.y + h) * w) / len;
  float bottomDist = q.y - h;
  float triDist = max(edgeDist, bottomDist);

  return triDist - radius;
}

void main() {
  if (u_RenderMode == 1) {
    vec2 size = max(u_Dimensions, vec2(1.0));
    vec2 pos = v_TexCoord * size;
    vec2 centered = pos - size * 0.5;
    float radius = min(u_Radius, min(size.x, size.y) * 0.5);
    float dist = roundedBoxDistance(centered, size * 0.5, radius);
    float aa = max(fwidth(dist), 1.0);
    float outerAlpha = 1.0 - smoothstep(0.0, aa, dist);
    if (outerAlpha <= 0.0) discard;

    float borderMix = 1.0 - smoothstep(u_BorderWidth - aa, u_BorderWidth + aa, -dist);
    vec4 color = mix(u_Color, u_BorderColor, borderMix);
    fragColor = vec4(color.rgb, color.a * outerAlpha);
    return;
  }

  if (u_RenderMode == 2) {
    // Rounded triangle (pointing UP)
    vec2 size = max(u_Dimensions, vec2(1.0));
    vec2 pos = v_TexCoord * size;
    vec2 centered = pos - size * 0.5;
    float radius = min(u_Radius, min(size.x, size.y) * 0.25);
    float dist = roundedTriangleDistance(centered, size * 0.5, radius, u_BorderWidth);
    float aa = max(fwidth(dist), 1.0);
    float outerAlpha = 1.0 - smoothstep(0.0, aa, dist);
    if (outerAlpha <= 0.0) discard;

    float borderMix = 1.0 - smoothstep(u_BorderWidth - aa, u_BorderWidth + aa, -dist);
    vec4 color = mix(u_Color, u_BorderColor, borderMix);
    fragColor = vec4(color.rgb, color.a * outerAlpha);
    return;
  }

  if (u_UseTexture) {
    vec2 sampledUV = v_TexCoord;
    if (u_Use9Slice && u_Dimensions.x > 0.0 && u_TextureSize.x > 0.0) {
      sampledUV = map9SliceCoord(v_TexCoord, u_Dimensions, u_TextureSize, u_SliceMargins);
    }
    vec4 texColor = texture(u_Sampler, sampledUV);
    fragColor = texColor * u_Color;
  } else {
    fragColor = u_Color;
  }
}`;
const msdfVertexShader = `#version 300 es

in vec4 a_Position;
in vec2 a_TexCoord;
in vec4 a_Color;
in float a_Z;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
out vec2 v_TexCoord;
out vec4 v_Color;

void main() {
  vec4 pos = a_Position;
  pos.z = a_Z;
  gl_Position = u_ProjMatrix * u_ViewMatrix * pos;
  v_TexCoord = a_TexCoord;
  v_Color = a_Color;
}`;
const msdfFragmentShader = `#version 300 es

precision mediump float;
in vec2 v_TexCoord;
in vec4 v_Color;
uniform sampler2D u_Atlas;
uniform float u_pxRange;
out vec4 fragColor;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

float screenPxRange() {
  vec2 unitRange = vec2(u_pxRange) / vec2(textureSize(u_Atlas, 0));
  vec2 screenTexSize = vec2(1.0) / fwidth(v_TexCoord);
  return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

void main() {
  vec4 sampleData = texture(u_Atlas, v_TexCoord);
  float sigDist = median(sampleData.r, sampleData.g, sampleData.b) - 0.5;
  float pxDistance = sigDist * screenPxRange();
  float opacity = clamp(pxDistance + 0.5, 0.0, 1.0);
  fragColor = vec4(v_Color.rgb, v_Color.a * opacity);
}`;
const iconBGVertexShader = `#version 300 es

in vec2 a_Position;
in vec4 a_Color;
in float a_Shape;
in vec2 a_BBoxMin;
in vec2 a_BBoxMax;
in float a_Z;

uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;

out vec4 v_Color;
out float v_Shape;
out vec2 v_BBoxMin;
out vec2 v_BBoxMax;
out vec2 v_Pos;

void main() {
  v_Color = a_Color;
  v_Shape = a_Shape;
  v_BBoxMin = a_BBoxMin;
  v_BBoxMax = a_BBoxMax;
  v_Pos = a_Position;
  gl_Position = u_ProjMatrix * u_ViewMatrix * vec4(a_Position, a_Z, 1.0);
}`;
const iconBGFragmentShader = `#version 300 es

precision mediump float;
in vec4 v_Color;
in float v_Shape;
in vec2 v_BBoxMin;
in vec2 v_BBoxMax;
in vec2 v_Pos;
out vec4 fragColor;

void main() {
  vec4 resColor = v_Color;
  if (v_Shape > 0.5) {
    vec2 bboxSize = v_BBoxMax - v_BBoxMin;
    vec2 normalized = (v_Pos - v_BBoxMin) / (bboxSize + 0.001);

    if (v_Shape < 1.5) {
      // Circle: discard if distance from center > 0.5
      float dist = distance(normalized, vec2(0.5));
      if (dist > 0.5) discard;
    } else {
      // Rounded-square: discard corners outside rounded rect
      float r = 0.25;
      vec2 p = abs(normalized - 0.5) * 2.0;
      vec2 d = p - (1.0 - r);
      if (length(max(d, 0.0)) > r) discard;
    }
  }

  fragColor = resColor;
}`;
const bgVertexShader = `#version 300 es

in vec4 a_Position;
void main() {
  gl_Position = a_Position;
  gl_PointSize = 4.0;
}`;
const bgFragmentShader = `#version 300 es

precision mediump float;
uniform vec4 u_Color;
uniform bool u_UsePointMask;
out vec4 fragColor;

void main() {
  if (u_UsePointMask) {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) {
      discard;
    } else {
      fragColor = u_Color;
    }
  } else {
    fragColor = u_Color;
  }
}`;
const shaders = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  bgFragmentShader,
  bgVertexShader,
  fragmentShader,
  iconBGFragmentShader,
  iconBGVertexShader,
  msdfFragmentShader,
  msdfVertexShader,
  vertexShader
}, Symbol.toStringTag, { value: "Module" }));
const SHELL = `
  <!-- WebGL Canvas -->
  <canvas id="2d-bg-canvas"></canvas>
  <canvas id="webgl-canvas"></canvas>

  <!-- Hidden 2D Canvas for Text to Texture generation -->
  <canvas id="2d-text-canvas" class="hidden"></canvas>

  <!-- Overlay 2D Canvas for crisp floating labels -->
  <canvas
    id="2d-label-canvas"
    style="pointer-events: none; z-index: 5"
  ></canvas>

  <!-- Custom DOM Overlay Containers -->
  <div id="gg-overlays-scaling" style="position: absolute; top: 0; left: 0; pointer-events: none; overflow: visible; z-index: 6; transform-origin: 0 0;"></div>
  <div id="gg-overlays-fixed" style="position: absolute; top: 0; left: 0; pointer-events: none; overflow: visible; z-index: 6; transform-origin: 0 0;"></div>

  <!-- Screen Reader Only Node List -->
  <ul
    id="sr-node-list"
    class="sr-only"
    aria-label="Workflow graph nodes"
    role="list"
  ></ul>

  <!-- History Pane -->
  <gg-history-pane id="undo-redo-wrapper"></gg-history-pane>

  <!-- Kebab Menu (Options) -->
  <gg-kebab-menu id="kebab-menu"></gg-kebab-menu>

  <!-- Sidebar Overlay -->
  <gg-ui-controls
    id="sidebar"
    class="sidebar collapsed"
    part="gg-ui-control-host"
  >
  </gg-ui-controls>

  <!-- Action Pane -->
  <gg-action-pane id="tool-panel"></gg-action-pane>

  <gg-loading-screen></gg-loading-screen>
`;
export {
  ActionPane,
  BUILTIN_DESCRIPTORS,
  CustomSelect,
  DEFAULT_HANDLE_STYLE,
  GGPropGroup,
  GraphEventEmitter,
  HANDLE_LAYOUT,
  HistoryPane,
  KebabMenu,
  LoadingScreen,
  Matrix4,
  NODE_LAYOUT,
  NODE_SIZE,
  NodeEditor,
  NodeTypeRegistry,
  SelectionToolbar,
  SHELL as Shell,
  TextureRegistry,
  TextureSelect,
  UIControls$1 as UIControls,
  Vector3,
  Vector4,
  compositionChildDescriptor,
  compositionDescriptor,
  deserializeGraph,
  generateTetureSkinOption,
  getCompositionReferenceTextureIds,
  getDefaultNodeSize,
  getDefaultTextureIds,
  groupDescriptor,
  hubDescriptor,
  isCandidateNodeType,
  isContainerNodeType,
  isLeafNodeType,
  isNodePrimitiveType,
  nodeDescriptor,
  serializeGraph,
  shaders,
  subgraphDescriptor
};
//# sourceMappingURL=graph-giraffe.js.map
