/* Podbean — inline icon set (stroke icons, 24px grid) */
(function () {
  const paths = {
    grid: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.6"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.6"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.6"/><rect x="14" y="14" width="6.5" height="6.5" rx="1.6"/>',
    broadcast: '<circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M7.8 16.2a6 6 0 0 1 0-8.4"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4"/><path d="M4.9 19.1a10 10 0 0 1 0-14.2"/><path d="M19.1 4.9a10 10 0 0 1 0 14.2"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>',
    trend: '<path d="m3 16 5.5-6 4 3L21 5"/><path d="M15.5 5H21v5.5"/>',
    wallet: '<path d="M20 7H6a2 2 0 0 1 0-4h11a1 1 0 0 1 1 1v3"/><path d="M4 5v14a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V9a2 2 0 0 0-2-2H6a2 2 0 0 1-2-2Z"/><path d="M16 13h.01"/>',
    'credit-card': '<rect x="2.5" y="5" width="19" height="14" rx="2.4"/><path d="M2.5 10h19"/><path d="M6.5 15h4"/>',
    banknote: '<rect x="2.5" y="6" width="19" height="12" rx="2.2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 10.4v3.2"/><path d="M18 10.4v3.2"/>',
    'money-bag': '<path d="M9.4 7.5 7.4 4h9.2l-2 3.5"/><path d="M9.4 7.5h5.2c3 1.8 4.7 4.4 4.7 7.7a6 6 0 0 1-6 5.8h-2.6a6 6 0 0 1-6-5.8c0-3.3 1.7-5.9 4.7-7.7Z"/><path d="M12.2 11v6.2"/><path d="M14.1 12.4a2 2 0 0 0-3.8.3c0 1.4 3.7 1 3.7 2.7a2 2 0 0 1-3.8.4"/>',
    users: '<path d="M16 21v-1.8a4 4 0 0 0-4-4H6.5a4 4 0 0 0-4 4V21"/><circle cx="9.25" cy="7.5" r="3.5"/><path d="M21.5 21v-1.8a4 4 0 0 0-3-3.87"/><path d="M16.5 4.13a3.5 3.5 0 0 1 0 6.74"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21v-1a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v1"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5.5 4.5a1 1 0 0 0 1.6-.8V6.3a1 1 0 0 0-1.6-.8L6 10H4a1 1 0 0 0-1 1Z"/><path d="M17 8.5a5 5 0 0 1 0 7"/><path d="M19.5 6a8 8 0 0 1 0 12"/><path d="M8.5 14v5a1 1 0 0 0 1 1H11"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 6.5-2.5 8.5-2.5 8.5h17S18 14.5 18 8"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/>',
    help: '<circle cx="12" cy="12" r="9.2"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4.9c0 1.9-2.8 2.5-2.8 4"/><path d="M12 17.2h.01"/>',
    info: '<circle cx="12" cy="12" r="9.2"/><path d="M12 11v5"/><path d="M12 7.6h.01"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m6 15 6-6 6 6"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    'chevron-left': '<path d="m15 6-6 6 6 6"/>',
    'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-up-right': '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    filter: '<path d="M4 5h16l-6.2 7.3V19l-3.6 1.8v-8.5Z"/>',
    more: '<circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.8 6.5 8.2 6 8.2-6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2.6-2.6a5 5 0 0 0-7-7L11.4 5.5"/><path d="M14 11a5 5 0 0 0-7.5-.5L3.9 13.1a5 5 0 0 0 7 7l1.7-1.7"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.2"/><path d="M15.5 8.5V5.8A2.3 2.3 0 0 0 13.2 3.5H5.8A2.3 2.3 0 0 0 3.5 5.8v7.4a2.3 2.3 0 0 0 2.3 2.3h2.7"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    'check-circle': '<circle cx="12" cy="12" r="9.2"/><path d="m8.2 12.2 2.6 2.6 5-5.2"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    globe: '<circle cx="12" cy="12" r="9.2"/><path d="M3 12h18"/><path d="M12 2.8c2.5 2.5 3.8 5.7 3.8 9.2S14.5 18.7 12 21.2c-2.5-2.5-3.8-5.7-3.8-9.2S9.5 5.3 12 2.8Z"/>',
    lock: '<rect x="4" y="10.5" width="16" height="10.5" rx="2.4"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/>',
    clock: '<circle cx="12" cy="12" r="9.2"/><path d="M12 7v5.2l3.4 2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    heart: '<path d="M20.6 5.9a5.2 5.2 0 0 0-7.4 0l-1.2 1.2-1.2-1.2a5.2 5.2 0 1 0-7.4 7.4l1.2 1.2L12 21.4l7.4-6.9 1.2-1.2a5.2 5.2 0 0 0 0-7.4Z"/>',
    'heart-filled': '<path fill="currentColor" stroke="none" d="M20.6 5.9a5.2 5.2 0 0 0-7.4 0l-1.2 1.2-1.2-1.2a5.2 5.2 0 1 0-7.4 7.4l1.2 1.2L12 21.4l7.4-6.9 1.2-1.2a5.2 5.2 0 0 0 0-7.4Z"/>',
    message: '<path d="M21 15a3 3 0 0 1-3 3H8.5L3.6 21.5a.5.5 0 0 1-.8-.4V6a3 3 0 0 1 3-3h12.2a3 3 0 0 1 3 3Z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.4"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m3.5 17 5-5 4 4 3-3 5 5"/>',
    upload: '<path d="M12 16V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M4 15v3.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V15"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V7"/><path d="M6 7l.8 12.2A2.2 2.2 0 0 0 9 21.3h6a2.2 2.2 0 0 0 2.2-2.1L18 7"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4.5 1.5L5 15Z"/>',
    pencil: '<path fill="currentColor" stroke="none" d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25ZM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/>',
    'pencil-outline': '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
    share: '<circle cx="18" cy="5" r="2.7"/><circle cx="6" cy="12" r="2.7"/><circle cx="18" cy="19" r="2.7"/><path d="m8.4 10.7 7.2-4.2"/><path d="m8.4 13.3 7.2 4.2"/>',
    'external-link': '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    play: '<path d="M7 4.5v15l13-7.5Z"/>',
    pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/>',
    shuffle: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    coins: '<ellipse cx="9" cy="6.5" rx="5.5" ry="2.5"/><path d="M3.5 6.5v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4"/><path d="M3.5 10.5v4c0 1.4 2.5 2.5 5.5 2.5 1 0 2-.1 2.8-.3"/><ellipse cx="15" cy="15.5" rx="5.5" ry="2.5"/><path d="M20.5 15.5v3.5c0 1.4-2.5 2.5-5.5 2.5s-5.5-1.1-5.5-2.5v-3.5"/>',
    gift: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v7.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V12"/><path d="M12 8v13"/><path d="M12 8S9.5 3.5 7.5 4.5 8.7 8 12 8Zm0 0s2.5-4.5 4.5-3.5S15.3 8 12 8Z"/>',
    sparkles: '<path d="M12 3.5 13.6 8l4.5 1.6-4.5 1.6L12 15.7l-1.6-4.5L5.9 9.6 10.4 8Z"/><path d="M18.5 14.5 19.4 17l2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9Z"/><path d="M5 15.5 5.7 17.3 7.5 18l-1.8.7L5 20.5l-.7-1.8L2.5 18l1.8-.7Z"/>',
    mic: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/><path d="M8.5 21h7"/>',
    sliders: '<path d="M4 7h5"/><path d="M15 7h5"/><circle cx="12" cy="7" r="2.2"/><path d="M4 12h9"/><path d="M19 12h1"/><circle cx="16" cy="12" r="2.2"/><path d="M4 17h1"/><path d="M11 17h9"/><circle cx="8" cy="17" r="2.2"/>',
    stop: '<rect x="5.5" y="5.5" width="13" height="13" rx="2.6" fill="currentColor" stroke="none"/>',
    laugh: '<circle cx="12" cy="12" r="8.5"/><path d="M8.6 9.6h.01M15.4 9.6h.01"/><path d="M8 13.5a4 4 0 0 0 8 0Z" fill="currentColor" stroke="none"/>',
    wind: '<path d="M3 8h9.5a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 12.5h13a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 17h6.5a2 2 0 1 1-2 2"/>',
    bird: '<path d="M16.5 6.5c2.5 0 4.5 1.8 4.5 4 0 2.4-2 4.3-4.6 4.3h-1.6L10 19H6.5l2.2-4.2A6 6 0 0 1 7 10c0-2 1.6-3.5 3.6-3.5 1 0 1.9.4 2.5 1.1"/><path d="m16.5 6.5 3.5-2.2-4.2-.6"/><circle cx="9.6" cy="8.6" r=".9" fill="currentColor" stroke="none"/>',
    ghost: '<path d="M5 10a7 7 0 0 1 14 0v9.5l-2.3-1.9-2.4 1.9-2.3-1.9L9.7 19.5 7.3 17.6 5 19.5Z"/><path d="M9.3 10h.01M14.7 10h.01"/>',
    zap: '<path d="M13.2 2.5 4.8 13.6h5.6l-.8 7.9 8.4-11.1h-5.6Z"/>',
    drum: '<ellipse cx="12" cy="8.5" rx="7" ry="2.8"/><path d="M5 8.5v7.4c0 1.6 3.1 2.9 7 2.9s7-1.3 7-2.9V8.5"/><path d="m17 4.5 2.6-2M19.5 7.2l2.4-1"/>',
    ball: '<circle cx="11" cy="15.5" r="3.8"/><path d="M11 9.5V3.5"/><path d="M7.6 6.6 5.6 4M14.4 6.6l2-2.6"/>',
    'mic-off': '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/><path d="M8.5 21h7"/><path d="M3.5 3.5 20.5 20.5"/>',
    phone: '<path d="M6.6 3.5h2.8l1.4 3.7-2 1.3a11.5 11.5 0 0 0 5.7 5.7l1.3-2 3.7 1.4v2.8a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    video: '<rect x="2.5" y="6" width="13" height="12" rx="2.4"/><path d="m15.5 10 5.5-3v10l-5.5-3"/>',
    'file-text': '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V8h5.5"/><path d="M8 12.5h8"/><path d="M8 16.5h5.5"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    'refresh': '<path d="M20.5 8A9 9 0 0 0 5 6L3 8"/><path d="M3 3v5h5"/><path d="M3.5 16A9 9 0 0 0 19 18l2-2"/><path d="M21 21v-5h-5"/>',
    download: '<path d="M12 3v12"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5"/>',
    send: '<path d="M21.5 2.5 10.8 13.2"/><path d="M21.5 2.5 14.7 21.5l-3.9-8.3-8.3-3.9Z"/>',
    alert: '<circle cx="12" cy="12" r="9.2"/><path d="M12 7.5V13"/><path d="M12 16.5h.01"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    'panel-left': '<rect x="3" y="3.5" width="18" height="17" rx="2.4"/><path d="M9.5 3.5v17"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/>',
    'dollar': '<path d="M12 2.5v19"/><path d="M16.5 6.5A4 4 0 0 0 13 4h-2.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7h-2.5a4 4 0 0 1-3.5-2.2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>',
    'list': '<path d="M9 6h12"/><path d="M9 12h12"/><path d="M9 18h12"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
    'verified': '<path fill="currentColor" stroke="none" d="M12 1.9l2.5 1.8 3-.1 1.1 2.8 2.7 1.5-.6 3 1.7 2.5-2 2.4.2 3-3 .6-1.8 2.5-3-.4L12 22l-2.5-1.5-3 .4-1.8-2.5-3-.6.2-3-2-2.4 1.7-2.5-.6-3 2.7-1.5 1-2.8 3 .1Z"/><path d="m8.4 12.2 2.4 2.4 4.8-4.9" fill="none" stroke="#fff" stroke-width="2"/>',
    'disc': '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v4"/><path d="M12 17v4"/>',
    'headphones': '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4.5" height="7" rx="2"/><rect x="17" y="13" width="4.5" height="7" rx="2"/>',
    'headphones-off': '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4.5" height="7" rx="2"/><rect x="17" y="13" width="4.5" height="7" rx="2"/><path d="M3.5 3.5 20.5 20.5"/>',
    'book-open': '<path d="M12 6.5C10.5 5 8.5 4.2 5.5 4.2H3v15h2.5c3 0 5 .8 6.5 2.3 1.5-1.5 3.5-2.3 6.5-2.3H21v-15h-2.5c-3 0-5 .8-6.5 2.3Z"/><path d="M12 6.5v15"/>',
    'shield': '<path d="M12 2.8 20 6v5.5c0 5-3.4 8.4-8 9.7-4.6-1.3-8-4.7-8-9.7V6Z"/><path d="m8.8 11.8 2.2 2.2 4.2-4.4"/>',
    'wifi': '<path d="M3 8.8a14 14 0 0 1 18 0"/><path d="M6.3 12.4a9.2 9.2 0 0 1 11.4 0"/><path d="M9.4 15.9a4.4 4.4 0 0 1 5.2 0"/><circle cx="12" cy="19.3" r="1.1" fill="currentColor" stroke="none"/>',
    'smile': '<circle cx="12" cy="12" r="9.2"/><path d="M8.4 14.4a4.6 4.6 0 0 0 7.2 0"/><path d="M9.2 9.6h.01"/><path d="M14.8 9.6h.01"/>',
    'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    'wings': '<path fill="currentColor" stroke="none" d="M11.2 13.7C9.2 10 5.8 8 2.2 8.4c.3 3.5 2.4 6 5.9 7.1l-2.7 2.9c3.1.3 5.7-.8 7.3-3.3Z"/><path fill="currentColor" stroke="none" d="M12.8 13.7c2-3.7 5.4-5.7 9-5.3-.3 3.5-2.4 6-5.9 7.1l2.7 2.9c-3.1.3-5.7-.8-7.3-3.3Z"/>',
    'superfan': '<path fill="currentColor" stroke="none" d="M2.3 9.3c1.7-.6 3.3-.3 4.7.8l2 1.5-1.2 2.2c-1.3-.3-2.4-1-3.3-1.9L2.3 9.3Z"/><path fill="currentColor" stroke="none" d="M21.7 9.3c-1.7-.6-3.3-.3-4.7.8l-2 1.5 1.2 2.2c1.3-.3 2.4-1 3.3-1.9l2.2-2.6Z"/><circle cx="12" cy="12" r="3.7" fill="currentColor"/><path fill="#ffffff" stroke="none" d="m12 9.8.85 1.72 1.9.28-1.37 1.34.32 1.9L12 14.14l-1.7.9.32-1.9L9.25 11.8l1.9-.28Z"/>'
  };

  window.icon = function icon(name, cls, size) {
    const body = paths[name] || paths.info;
    const klass = 'icon' + (cls ? ' ' + cls : '');
    const dim = size ? ` width="${size}" height="${size}"` : '';
    return `<svg${dim} class="${klass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  };

  window.logoMark = function logoMark() {
    return `<svg viewBox="0 0 32 32" role="img" aria-label="Podbean">
      <rect width="32" height="32" rx="8" fill="#0f1115"/>
      <circle cx="16" cy="21.2" r="3.2" fill="#7fbb35"/>
      <path d="M10.6 16.2Q16 10.6 21.4 16.2" fill="none" stroke="#7fbb35" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M6.8 12.2Q16 4.6 25.2 12.2" fill="none" stroke="#7fbb35" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`;
  };
})();
