// Prosty system tłumaczeń PL/EN oparty na Zustand (bez react-i18next)
// Użycie: const { language } = useAppStore(); t(language, 'klucz')

export type Lang = 'pl' | 'en'

const T = {
  // ── Nawigacja ────────────────────────────────────────────────────────────────
  nav_dashboard: { pl: 'Projekty', en: 'Dashboard' },
  nav_new: { pl: 'Nowy projekt', en: 'New Project' },
  nav_simulator: { pl: 'Symulator', en: 'Simulator' },
  nav_settings: { pl: 'Ustawienia', en: 'Settings' },
  nav_logout: { pl: 'Wyloguj', en: 'Log out' },
  nav_batch: { pl: 'Batch Wywiady', en: 'Batch Interviews' },
  search_ph: { pl: 'Szukaj...', en: 'Search...' },

  // ── Dashboard ────────────────────────────────────────────────────────────────
  dash_overview: { pl: 'Przegląd Discovery', en: 'Discovery Overview' },
  dash_total: { pl: 'Łącznie projektów', en: 'Total Projects' },
  dash_queued: { pl: 'Oczekuje', en: 'Queued' },
  dash_done: { pl: 'Ukończone', en: 'Completed' },
  dash_success_rate: { pl: 'Trafność', en: 'Success rate' },
  dash_session_stats: { pl: 'Statystyki sesji', en: 'Session Statistics' },
  dash_effectiveness: { pl: 'Efektywność Discovery', en: 'Discovery Effectiveness' },
  dash_table_title: { pl: 'Harmonogram projektów', en: 'Projects Schedule' },
  dash_col_no: { pl: 'Nr', en: 'No' },
  dash_col_name: { pl: 'Nazwa', en: 'Name' },
  dash_col_mode: { pl: 'Tryb', en: 'Mode' },
  dash_col_status: { pl: 'Status', en: 'Status' },
  dash_col_date: { pl: 'Data', en: 'Date' },
  dash_col_action: { pl: 'Akcja', en: 'Action' },
  dash_empty: { pl: 'Brak projektów.', en: 'No projects found.' },
  dash_create_one: { pl: 'Utwórz jeden', en: 'Create one' },
  dash_new_btn: { pl: 'Nowy projekt', en: 'New Project' },
  dash_filter: { pl: 'Filtruj', en: 'Filter' },
  dash_export: { pl: 'Eksport', en: 'Export' },
  dash_sessions_label: { pl: 'sesji', en: 'sessions' },
  dash_high_conf: { pl: 'Wysoka pewność', en: 'High Confidence' },
  dash_medium_conf: { pl: 'Średnia pewność', en: 'Medium Confidence' },
  dash_low_conf: { pl: 'Niska pewność', en: 'Low Confidence' },

  // ── Statusy ──────────────────────────────────────────────────────────────────
  status_queued: { pl: 'Oczekuje', en: 'Queued' },
  status_running: { pl: 'W toku', en: 'Running' },
  status_completed: { pl: 'Ukończona', en: 'Completed' },
  status_failed: { pl: 'Błąd', en: 'Failed' },

  // ── New Discovery ─────────────────────────────────────────────────────────────
  nd_title: { pl: 'Nowy projekt', en: 'New Project' },
  nd_subtitle: { pl: 'Uruchom workflow discovery na podstawie Twojego pomysłu.', en: 'Launch a new product discovery workflow based on your idea.' },
  nd_project_name: { pl: 'Nazwa projektu', en: 'Project Name' },
  nd_project_ph: { pl: 'np. freelancer-tools, adtech-transparency', en: 'e.g. freelancer-tools, adtech-transparency' },
  nd_idea: { pl: 'Opis pomysłu + kontekst', en: 'Idea Description & Context' },
  nd_idea_ph: { pl: 'Opisz pomysł, problem który rozwiązujesz, segment klientów, zebrane obserwacje...', en: 'Describe the idea, the problem you are solving, the customer segment, gathered observations...' },
  nd_idea_hint: { pl: 'Im więcej kontekstu (obserwacje, dane rynkowe, insighty), tym lepsza analiza.', en: 'The more context you provide (observations, market data, insights), the better the analysis.' },
  nd_mode: { pl: 'Tryb Discovery', en: 'Discovery Mode' },
  nd_mode_auto_desc: { pl: 'Pełna analiza — wszystkie 8 węzłów', en: 'Full analysis — all 8 nodes' },
  nd_mode_problem_desc: { pl: 'Walidacja problemu i bólu użytkownika', en: 'Problem & user pain validation' },
  nd_mode_solution_desc: { pl: 'CO/JAK zbudować — mając problem potwierdzony', en: 'WHAT/HOW to build — given confirmed problem' },
  nd_notes: { pl: 'Notatki z wywiadów', en: 'Interview Notes' },
  nd_notes_optional: { pl: 'Opcjonalne', en: 'Optional' },
  nd_notes_ph: { pl: 'Wklej surowe notatki z wywiadów (wzmacnia poziom dowodów) lub wgraj plik poniżej.', en: 'Paste raw interview notes here (strengthens evidence level) or upload a file below.' },
  nd_attach: { pl: 'Załącz plik .md / .txt', en: 'Attach .md / .txt' },
  nd_cancel: { pl: 'Anuluj', en: 'Cancel' },
  nd_launch: { pl: 'Uruchom Discovery', en: 'Launch Discovery' },
  nd_launching: { pl: 'Inicjowanie...', en: 'Initializing...' },

  // ── Simulator ────────────────────────────────────────────────────────────────
  sim_title: { pl: 'Symulator wywiadów', en: 'Interview Simulator' },
  sim_desc: { pl: 'Ćwicz pytania behawioralne na syntetycznych użytkownikach zanim przeprowadzisz prawdziwe wywiady.', en: 'Practice behavioral questions with synthetic users before conducting real interviews.' },
  sim_step1_label: { pl: 'Zdefiniuj segment', en: 'Define Segment' },
  sim_step2_label: { pl: 'Wybierz archetyp', en: 'Select Archetype' },
  sim_step3_label: { pl: 'Symulator wywiadu', en: 'Interview Simulator' },
  sim_step1_title: { pl: 'Opisz docelowy segment', en: 'Describe Target Segment' },
  sim_step1_ph: { pl: 'np. "Freelancerzy UX, 5-15 klientów rocznie, Polska"', en: 'e.g. "UX Freelancers with 5-15 clients annually in Europe"' },
  sim_generate: { pl: 'Generuj 4 syntetyczne profile', en: 'Generate 4 Synthetic Profiles' },
  sim_generating: { pl: 'Generowanie archetypów...', en: 'Generating Archetypes...' },
  sim_time_hint: { pl: 'Generowanie zajmuje ~30s — 4 niezależne wywołania LLM', en: 'Generation takes ~30s — 4 independent LLM calls' },
  sim_step2_title: { pl: 'Wybierz personę do wywiadu', en: 'Select Persona for Interview' },
  sim_change_segment: { pl: 'Zmień segment', en: 'Change Segment' },
  sim_back_personas: { pl: '← Powrót do person', en: '← Back to Personas' },
  sim_forces: { pl: 'Hipoteza sił', en: 'Forces Hypothesis' },
  sim_hypotheses: { pl: 'Hipotezy do przetestowania', en: 'Hypotheses to Test' },

  // ── SimulatorChat ────────────────────────────────────────────────────────────
  chat_title_prefix: { pl: 'Rozmowa z:', en: 'Interview with:' },
  chat_hint: { pl: 'Zadaj pytanie — Enter lub kliknij Wyślij', en: 'Ask a question — Enter or click Send' },
  chat_empty: { pl: 'Zadaj pierwsze pytanie personie', en: 'Ask your first question to the persona' },
  chat_tip: { pl: 'Wskazówka: zacznij od pytania o przeszłe zachowanie, nie preferencje', en: 'Tip: start with past behavior, not preferences' },
  chat_send: { pl: 'Wyślij', en: 'Send' },
  chat_ph: { pl: 'Zadaj pytanie... (Enter = wyślij)', en: 'Ask a question... (Enter = send)' },
  chat_details: { pl: 'szczegóły ▼', en: 'details ▼' },
  chat_hide: { pl: 'ukryj ▲', en: 'hide ▲' },
  chat_thought: { pl: '💭 Ukryta myśl:', en: '💭 Hidden thought:' },
  chat_followup: { pl: '🎯 Follow-up:', en: '🎯 Follow-up:' },
  chat_use_followup: { pl: 'Użyj tego pytania →', en: 'Use this question →' },
  chat_ready: { pl: 'Gotowy do rozmowy', en: 'Ready to answer' },
  chat_empty_title: { pl: 'Rozpocznij wywiad', en: 'Start the Interview' },
  chat_empty_sub: { pl: 'Zadaj pierwsze pytanie. Skup się na konkretnych zachowaniach z przeszłości, nie na hipotezach.', en: 'Ask your first question. Focus on specific past behaviors rather than general hypothetical preferences.' },
  chat_hide_insights: { pl: 'Ukryj wgląd', en: 'Hide Insights' },
  chat_reveal: { pl: 'Pokaż wgląd', en: 'Reveal Insights' },
  chat_hidden_thought: { pl: 'Ukryta myśl', en: 'Hidden Thought' },
  chat_ideal_followup: { pl: 'Idealny follow-up', en: 'Ideal Follow-up' },
  chat_disclaimer: { pl: 'Syntetyczni użytkownicy mogą dryfować. Używaj konkretnych pytań uzupełniających.', en: 'Synthetic users may occasionally drift. Use specific follow-ups.' },

  // ── ArchetypeCard ─────────────────────────────────────────────────────────────
  arch_profile: { pl: 'Profil', en: 'Profile' },
  arch_psych: { pl: 'Psychologia', en: 'Psychology' },
  arch_jtbd: { pl: 'JTBD', en: 'JTBD' },
  arch_hypotheses: { pl: 'Hipotezy do sprawdzenia', en: 'Hypotheses to Test' },
  arch_red_flags: { pl: '🚩 Red flags', en: '🚩 Red Flags' },

  // ── Settings ─────────────────────────────────────────────────────────────────
  set_title: { pl: 'Ustawienia', en: 'Settings' },
  set_lang_title: { pl: 'Język interfejsu', en: 'Interface Language' },
  set_lang_desc: { pl: 'Wybierz język wyświetlania interfejsu aplikacji.', en: 'Choose the display language for the application interface.' },
  set_api_title: { pl: 'API & Model', en: 'API & Model' },
  set_api_key: { pl: 'Klucz API Anthropic', en: 'Anthropic API Key' },
  set_api_key_ph: { pl: 'sk-ant-...', en: 'sk-ant-...' },
  set_api_key_hint: { pl: 'Zapisywany w ~/.product-discovery/config.json na Twoim komputerze.', en: 'Saved to ~/.product-discovery/config.json on your computer.' },
  set_model: { pl: 'Model LLM (kolejne sesje)', en: 'LLM Model (next sessions)' },
  set_model_hint: { pl: 'Wybór modelu dotyczy przyszłych sesji Discovery.', en: 'Model selection applies to future Discovery sessions.' },
  set_save: { pl: 'Zapisz ustawienia', en: 'Save Settings' },
  set_saved: { pl: '✓ Zapisano!', en: '✓ Saved!' },
  set_data_title: { pl: 'Folder danych', en: 'Data Folder' },
  set_data_desc: { pl: 'Tutaj przechowywane są Twoje projekty, baza sesji i tokeny Google.', en: 'Your projects, session database and Google tokens are stored here.' },
  set_data_dir: { pl: 'Ścieżka do folderu', en: 'Folder path' },
  set_data_dir_ph: { pl: 'np. C:\\Users\\{user}\\product-discovery-data', en: 'e.g. /home/{user}/product-discovery-data' },
  set_research_title: { pl: 'Klucze API — Research', en: 'API Keys — Research' },
  set_research_desc: { pl: 'Opcjonalne klucze do wzbogacenia analizy OSINT i research konkurencji.', en: 'Optional keys to enrich OSINT and competitive research analysis.' },
  set_miro_title: { pl: 'Miro', en: 'Miro' },
  set_miro_desc: { pl: 'Eksport Forces Diagram i Assumption Map do tablicy Miro.', en: 'Export Forces Diagram and Assumption Map to a Miro board.' },
  set_miro_token: { pl: 'Access Token', en: 'Access Token' },
  set_miro_token_ph: { pl: 'miro_...', en: 'miro_...' },
  set_miro_board: { pl: 'Board ID', en: 'Board ID' },
  set_miro_board_ph: { pl: 'np. uXjVIF6XLmc=', en: 'e.g. uXjVIF6XLmc=' },
  set_slack_title: { pl: 'Slack', en: 'Slack' },
  set_slack_desc: { pl: 'Powiadomienia po zakończeniu Discovery (Webhook — bezpieczne, bez OAuth).', en: 'Notifications when Discovery completes (Webhook — secure, no OAuth).' },
  set_slack_url: { pl: 'Webhook URL', en: 'Webhook URL' },
  set_slack_url_ph: { pl: 'https://hooks.slack.com/services/...', en: 'https://hooks.slack.com/services/...' },
  set_slack_auto: { pl: 'Auto-powiadomienie po każdym Discovery', en: 'Auto-notify after each Discovery' },
  set_google_title: { pl: 'Google Docs', en: 'Google Docs' },
  set_google_desc: { pl: 'Eksportuj raporty bezpośrednio do Google Docs na swoim koncie Google.', en: 'Export reports directly to Google Docs on your Google account.' },
  set_google_client_id: { pl: 'Google Client ID', en: 'Google Client ID' },
  set_google_client_secret: { pl: 'Google Client Secret', en: 'Google Client Secret' },
  set_google_oauth_hint: { pl: 'Wymagane: utwórz projekt w Google Cloud Console, włącz Docs API i Drive API, pobierz OAuth2 credentials.', en: 'Required: create a project in Google Cloud Console, enable Docs API and Drive API, download OAuth2 credentials.' },
  set_google_login: { pl: 'Zaloguj się z Google', en: 'Sign in with Google' },
  set_google_logout: { pl: 'Wyloguj z Google', en: 'Sign out from Google' },
  set_google_connected: { pl: 'Połączono', en: 'Connected' },
  set_google_not_connected: { pl: 'Niezalogowany', en: 'Not signed in' },
  set_google_connecting: { pl: 'Otwieranie okna logowania...', en: 'Opening sign-in window...' },
  set_mock_title: { pl: 'Tryb testowy', en: 'Test Mode' },
  set_mock_desc: { pl: 'Discovery Mock Mode — zwraca fixture bez wywołań LLM (~3s, $0).', en: 'Discovery Mock Mode — returns fixtures without LLM calls (~3s, $0).' },
  set_mock_label: { pl: 'Włącz Mock Mode', en: 'Enable Mock Mode' },
  set_optional: { pl: 'opcjonalne', en: 'optional' },
  set_configured: { pl: 'skonfigurowany', en: 'configured' },
  set_not_configured: { pl: 'nieskonfigurowany', en: 'not configured' },
  set_loading: { pl: 'Ładowanie ustawień...', en: 'Loading settings...' },
  set_key_keep: { pl: '(pozostaw puste żeby zachować)', en: '(leave empty to keep current)' },
  set_already_set: { pl: '(skonfigurowany — wpisz nowy żeby zmienić)', en: '(configured — type to replace)' },

  // ── Usage & Costs ────────────────────────────────────────────────────────────
  usage_title: { pl: 'Zużycie i koszty', en: 'Usage & Costs' },
  usage_desc: { pl: 'Bieżące zużycie tokenów i estymowane koszty zapytań API.', en: 'Current token usage and estimated API costs.' },
  usage_tokens: { pl: 'Zużyte tokeny (30 dni)', en: 'Tokens used (30 days)' },
  usage_cost: { pl: 'Estymowany koszt', en: 'Estimated cost' },
  usage_limit: { pl: 'Limit budżetu', en: 'Budget limit' },
  usage_cycle: { pl: 'Cykl rozliczeniowy: Marzec 2026', en: 'Billing cycle: March 2026' },

  // ── Onboarding Banner ────────────────────────────────────────────────────────
  onboard_badge: { pl: 'Nowy?', en: 'New here?' },
  onboard_title: { pl: 'Przewodnik po aplikacji', en: 'App Guide' },
  onboard_hide: { pl: 'Ukryj na zawsze', en: 'Dismiss permanently' },
  onboard_show: { pl: 'Pokaż przewodnik', en: 'Show guide' },

  onboard_what_title: { pl: '📌 Co to jest?', en: '📌 What is this?' },
  onboard_what_desc: {
    pl: 'Product Discovery to narzędzie dla Product Managerów, które pomaga odpowiedzieć na pytanie: „Czy warto budować ten produkt?" — zanim wpiszesz choć jeden wiersz kodu. Analizuje Twój pomysł z pomocą AI, przeprowadza syntetyczne wywiady z użytkownikami i dostarcza raport z rekomendacją GO / NO-GO.',
    en: 'Product Discovery helps Product Managers answer: "Should we build this?" — before writing a single line of code. It analyzes your idea with AI, runs synthetic user interviews, and delivers a report with a GO / NO-GO recommendation.',
  },

  onboard_how_title: { pl: '🚀 Jak zacząć?', en: '🚀 How to start?' },
  onboard_step1: {
    pl: 'Przejdź do Ustawień i wklej klucz API Anthropic (wymagany)',
    en: 'Go to Settings and paste your Anthropic API key (required)',
  },
  onboard_step2: {
    pl: 'Kliknij „Nowy projekt" i opisz swój pomysł na produkt',
    en: 'Click "New Project" and describe your product idea',
  },
  onboard_step3: {
    pl: 'Wybierz tryb, kliknij „Uruchom Discovery" i poczekaj ~3–5 minut',
    en: 'Choose a mode, click "Launch Discovery" and wait ~3–5 minutes',
  },

  onboard_modes_title: { pl: '🎯 Trzy tryby discovery', en: '🎯 Three discovery modes' },
  onboard_mode_auto: {
    pl: 'Auto — pełna analiza (polecany na start)',
    en: 'Auto — full analysis (recommended for starters)',
  },
  onboard_mode_problem: {
    pl: 'Problem — czy ten ból naprawdę istnieje?',
    en: 'Problem — does this pain point really exist?',
  },
  onboard_mode_solution: {
    pl: 'Rozwiązanie — co i jak zbudować, gdy problem jest potwierdzony',
    en: 'Solution — what and how to build, once the problem is confirmed',
  },

  onboard_concepts_title: { pl: '💡 Kluczowe pojęcia', en: '💡 Key concepts' },
  onboard_jtbd_label: { pl: 'JTBD (Jobs-to-be-Done)', en: 'JTBD (Jobs-to-be-Done)' },
  onboard_jtbd_desc: {
    pl: 'Ludzie nie kupują produktów — „wynajmują" je do wykonania konkretnej pracy. Odkrycie tej pracy to serce całej analizy.',
    en: 'People don\'t buy products — they "hire" them to get a job done. Discovering that job is the core of the analysis.',
  },
  onboard_evidence_label: { pl: 'Poziomy dowodów (0–5)', en: 'Evidence levels (0–5)' },
  onboard_evidence_desc: {
    pl: 'Opinia to poziom 0. Faktyczna transakcja to poziom 5. Im wyższy poziom dowodów, tym większa pewność decyzji GO.',
    en: 'Opinion is level 0. A real transaction is level 5. Higher evidence level = more confidence in the GO decision.',
  },
  onboard_sim_label: { pl: 'Symulator wywiadów', en: 'Interview Simulator' },
  onboard_sim_desc: {
    pl: 'Ćwicz pytania behawioralne na syntetycznych personach zanim porozmawiasz z prawdziwymi użytkownikami. Dostępny w menu po lewej.',
    en: 'Practice behavioral interview questions with synthetic personas before talking to real users. Available in the left menu.',
  },
} satisfies Record<string, { pl: string; en: string }>

export type LangKey = keyof typeof T

export function t(lang: Lang, key: LangKey): string {
  const entry = T[key]
  if (!entry) return key
  return entry[lang] ?? entry.en ?? key
}
