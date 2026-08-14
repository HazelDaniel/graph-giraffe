const STYLE_TEMPLATE = `
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
export class ActionPane extends HTMLElement {
    #shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
        this.render();
        this.setupListeners();
    }
    setupListeners() {
        const kebabToggle = this.#shadow.querySelector("#btn-kebab-toggle");
        const subpane = this.#shadow.querySelector("#kebab-subpane");
        if (!kebabToggle || !subpane)
            return;
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
        this.#shadow.innerHTML = `
    <style>
      ${STYLE_TEMPLATE}
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

        <button id="btn-comment-mode" title="Comment">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V13C20 14.1046 19.1046 15 18 15H11.5L7 19V15H6C4.89543 15 4 14.1046 4 13V5Z"
              fill="currentColor"
            />
            <circle cx="8" cy="9" r="1.4" fill="#0b0b0b" />
            <circle cx="12" cy="9" r="1.4" fill="#0b0b0b" />
            <circle cx="16" cy="9" r="1.4" fill="#0b0b0b" />
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

        <button id="btn-kebab-toggle" title="More Actions">
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
if (!customElements.get("gg-action-pane"))
    customElements.define("gg-action-pane", ActionPane);
//# sourceMappingURL=action-pane.js.map