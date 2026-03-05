export type AiAutomation = 'yes' | 'partial' | 'no'

export interface Framework {
    id: string
    category: 'cycle' | 'problem' | 'validation' | 'market' | 'artifact' | 'prioritization' | 'metrics'
    name: string
    shortName?: string
    author: string
    assumption: string
    phases: string[]
    artifacts: string[]
    whenToUse: string
    limitations: string
    aiAutomation: AiAutomation
    complexity: 1 | 2 | 3 | 4 | 5
    cycleDuration: string
    techniques?: { name: string; description: string; icon: string }[]
    examples?: string[]
    imageUrl?: string
}

export const FRAMEWORKS: Framework[] = [
    // ── Cykle i procesy ───────────────────────────────────────────────────────
    {
        id: 'double-diamond',
        category: 'cycle',
        name: 'Double Diamond',
        shortName: 'DD',
        author: 'British Design Council (2005)',
        assumption: 'Skuteczny proces projektowy musi oddzielać fazę eksploracji problemu od fazy poszukiwania rozwiązania, stosując naprzemiennie myślenie dywergencyjne (rozszerzanie) i konwergencyjne (zawężanie).',
        phases: [
            '◇ DISCOVER [dywergencja problemu] — obserwacje, wywiady, empatia, etnografia. Zbierasz insights o rzeczywistych potrzebach użytkowników bez oceniania',
            '◆ DEFINE [konwergencja problemu] — strukturyzujesz i filtrujesz zebrane dane. Efekt: precyzyjny Problem Statement / HMW Statement',
            '◇ DEVELOP [dywergencja rozwiązań] — burza mózgów, prototypowanie, kreatywne poszukiwanie wielu alternatywnych rozwiązań',
            '◆ DELIVER [konwergencja i testowanie] — selekcja, testowanie z użytkownikami, finalizacja i launch wybranego rozwiązania',
        ],
        artifacts: ['Problem Statement / HMW', 'Design Brief', 'Persony + Empathy Map', 'Customer Journey Map', 'Prototypy (lo-fi → hi-fi)', 'User Test Report'],
        whenToUse: 'Przy wysokim stopniu niepewności, redefiniowaniu strategii produktu, innowacjach przełomowych lub projektach gdzie nie wiadomo jeszcze jaki jest PRAWDZIWY problem.',
        limitations: 'Oryginalny model jest ściśle liniowy — brak pętli feedbacku między diamentami. Kończy się "launchem", nie walidowanymi ideami. Zakłada, że po Deliver masz rację — w PM rzadko tak jest. Wymaga adaptacji (patrz: Double Diamond PM Adaptation).',
        aiAutomation: 'partial',
        complexity: 3,
        cycleDuration: 'tygodnie–miesiące',
        imageUrl: '/assets/frameworks/double_diamond.png',
        examples: [
            'NHS UK — przeprojektowanie systemu rejestracji wizyt: odkryto że pacjenci boją się dzwonić, nie że strona jest zła (Discover → redefinicja problemu)',
            'IDEO / Oral-B — redefiniowanie szczoteczki dla dzieci: problem to nie "mała rączka" ale "brak motywacji do mycia zębów"',
            'Airbnb — przejście z "wynajmu powietrza" do "belong anywhere": obie fazy Discover i Define radykalnie zmieniły framing produktu'
        ]
    },
    {
        id: 'double-diamond-pm',
        category: 'cycle',
        name: 'Double Diamond (PM Adaptation)',
        shortName: 'DD-PM',
        author: 'Paweł Huryn / Product Compass',
        assumption: 'Oryginalny Double Diamond jest zbyt liniowy i kończy się launchem. Dla Product Discovery potrzebujemy modelu z iteracjami i walidacją założeń PRZED wdrożeniem — nie po.',
        phases: [
            '🔍 EXPLORE [dywergencja + konwergencja] — nie tylko wywiady z użytkownikami, ale też data analytics, market research, stakeholder interviews, competitor analysis. Cel: zebranie insights z wielu źródeł i wybranie najważniejszych szans (opportunities)',
            '💡 IDEATE [dywergencja] — burza mózgów bez oceniania, eksploracja przestrzeni rozwiązań, SCAMPER, analogie, reverse brainstorming. Cel: wiele potencjalnych rozwiązań dla wybranych szans',
            '🧪 TEST [konwergencja] — testowanie założeń (nie gotowego produktu!), pretotypy, wywiady walidacyjne, fake doors, Experiment Canvas. Cel: wybranie idei z walidowanymi założeniami do implementacji',
            '🔄 ITERATE — każda faza jest iteracyjna. Wynik testu może cofnąć do Explore lub Ideate. Continuous Discovery zamiast liniowego flow',
        ],
        artifacts: ['Opportunity Map (szanse z wywiadów)', 'Assumption Set (FATAL/HIGH/MEDIUM)', 'Experiment Log', 'Validated Idea Brief', 'Evidence Grade (0-5)'],
        whenToUse: 'Adaptacja dla Product Managerów pracujących w iteracyjnym środowisku. Szczególnie gdy: masz dostęp do danych analitycznych (nie tylko wywiadów), pracujesz w zwinnym zespole, chcesz unikać kosztownych wdrożeń niesprawdzonych pomysłów.',
        limitations: 'Wymaga zdyscyplinowania — łatwo wrócić do oryginalnego linearnego flow "bo deadline". Faza Test musi testować założenia, nie tylko UX prototypu. Sekcja Continuous Delivery (CD) to osobna warstwa nieuwzględniona w podstawowym modelu.',
        aiAutomation: 'yes',
        complexity: 3,
        cycleDuration: '2–4 tygodnie per iteracja',
        imageUrl: 'https://substackcdn.com/image/fetch/$s_!m5vx!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff9db3e59-0e5c-49c7-881b-2802312b34a9_1126x673.png',
        examples: [
            'EXPLORE: analiza churnu w danych + 5 wywiadów wychodzących → odkrycie że użytkownicy odchodzą przez brak onboarding checklist (nie przez cenę)',
            'IDEATE: 3 różne podejścia do onboardingu: guided tour / progress bar / personal coach — bez oceniania które jest "lepsze"',
            'TEST: fake door test — przycisk "Personal Coach" na stronie głównej mierzy CTR zanim napiszesz linijkę kodu feature\'u'
        ]
    },
    {
        id: 'lean-startup',
        category: 'cycle',
        name: 'Lean Startup',
        shortName: 'BML',
        author: 'Eric Ries',
        assumption: 'Zespoły powinny systematycznie testować hipotezy biznesowe przez iteracyjną pętlę uczenia się, minimalizując marnotrawstwo zasobów.',
        phases: ['Build (buduj MVP)', 'Measure (mierz kluczowe wskaźniki)', 'Learn (ucz się: Pivot lub Persevere)'],
        artifacts: ['Minimum Viable Product (MVP)', 'Log decyzji (Pivot/Persevere)', 'Actionable Metrics'],
        whenToUse: 'Na wczesnych etapach nowych inicjatyw, gdzie ryzyko rynkowe drastycznie przewyższa ryzyko techniczne.',
        limitations: 'Często błędnie używane jako wymówka do wypuszczania produktów niskiej jakości; niezalecane dla produktów krytycznych dla zdrowia/życia.',
        aiAutomation: 'yes',
        complexity: 2,
        cycleDuration: 'dni–tygodnie',
        imageUrl: '/assets/frameworks/lean_startup.png',
        examples: [
            'Dropbox — film wideo demonstrujący działanie produktu jako MVP',
            'Zappos — ręczna realizacja zamówień butów przed zbudowaniem stocku',
            'Buffer — jednostronicowa witryna sprawdzająca zainteresowanie cennikiem'
        ]
    },
    {
        id: 'design-sprint',
        category: 'cycle',
        name: 'Design Sprint',
        author: 'Jake Knapp / Google Ventures',
        assumption: 'Skondensowanie projektowania, prototypowania i testowania do 5 dni pozwala zaoszczędzić miesiące pracy nad błędnymi rozwiązaniami.',
        phases: ['Map (zdefiniowanie celu)', 'Sketch (szkicowanie rozwiązań)', 'Decide (wybór + storyboard)', 'Prototype (budowa fasady)', 'Test (wywiady z 5 użytkownikami)'],
        artifacts: ['High-fidelity prototype', 'Friday Insights Report', 'Storyboard'],
        whenToUse: 'Przy projektach o wysokiej stawce, gdy zespół jest zablokowany, na kick-offach dużych inicjatyw.',
        limitations: 'Zbyt kosztowne czasowo dla błahych optymalizacji; wymaga pełnego 5-dniowego wyłączenia kluczowych ekspertów.',
        aiAutomation: 'partial',
        complexity: 3,
        cycleDuration: '5 dni',
        imageUrl: '/assets/frameworks/design_sprint.png',
        examples: [
            'Savioke — projekt i testowanie ekranu dotykowego dla robota hotelowego w 5 dni',
            'Blue Bottle Coffee — weryfikacja koncepcji nowego sklepu online przed startem IT',
            'Lego — stworzenie pierwszego namacalnego prototypu aplikacji do klocków bez pisania kodu'
        ]
    },
    {
        id: 'continuous-discovery',
        category: 'cycle',
        name: 'Continuous Discovery',
        shortName: 'CD',
        author: 'Teresa Torres',
        assumption: 'Odkrywanie produktu to nie jednorazowa faza, lecz stały nawyk. Zespół produktowy (Trio) powinien regularnie wchodzić w interakcję z klientami.',
        phases: ['Zdefiniowanie Desired Outcome', 'Customer Interviewing (ciągłe wywiady)', 'Opportunity Mapping', 'Assumption Testing'],
        artifacts: ['Opportunity Solution Tree (OST)', 'Interview Snapshot', 'Assumption Test Log'],
        whenToUse: 'Dojrzałe produkty i zespoły dążące do pracy w modelu outcome-driven, reagujące na rynek zwinnie.',
        limitations: 'Wymaga zaawansowanej kultury organizacyjnej; przy braku dostępu do klientów proces upada.',
        aiAutomation: 'yes',
        complexity: 4,
        cycleDuration: 'ciągły',
        imageUrl: '/assets/frameworks/continuous_discovery.png',
        examples: [
            'Spotify — regularne, cotygodniowe wywiady z użytkownikami przez Product Trio',
            'Zendesk — mapowanie na bieżąco szans rynkowych napływających ze zgłoszeń CS',
            'Amplitude — ciągłe testowanie założeń za pomocą mikro-eksperymentów omijających długie release\'y'
        ]
    },
    {
        id: 'dual-track-agile',
        category: 'cycle',
        name: 'Dual-Track Agile',
        author: 'Marty Cagan (SVPG) / Jeff Patton',
        assumption: 'Proces produktowy dzieli się na dwie równoległe ścieżki: Discovery (uczenie się) i Delivery (dostarczanie kodu).',
        phases: ['Discovery Track (walidacja wartości, użyteczności, wykonalności)', 'Delivery Track (planowanie, wytwarzanie, QA, deployment)'],
        artifacts: ['Validated Backlog', 'Prototypy', 'Evidence Log'],
        whenToUse: 'Kiedy chcemy skalować zespoły zwinne i minimalizować dług technologiczny.',
        limitations: 'Ryzyko silosów ("my wymyślamy, wy kodujecie"). Deweloperzy muszą uczestniczyć w Discovery.',
        aiAutomation: 'partial',
        complexity: 4,
        cycleDuration: 'tygodnie (sprinty)',
        imageUrl: '/assets/frameworks/dual_track.png',
        examples: [
            'Atlassian — jednoczesne badanie użyteczności nowej funkcji przez design podczas gdy dev buduje architekturę',
            'SaaS Startup — ścieżka badawcza o 2 sprinty wyprzedzająca ścieżkę deweloperską',
            'Miro — ciągły feedback loop z klientami zasilający bezpośrednio backlog sprintu technicznego'
        ]
    },
    {
        id: 'shape-up',
        category: 'cycle',
        name: 'Shape Up',
        author: 'Ryan Singer / Basecamp',
        assumption: 'Zamiast estymować czas, firma narzuca "apetyt" czasowy (np. 6 tygodni), a zespół autonomicznie dobiera zakres.',
        phases: ['Shaping (kształtowanie + de-risking)', 'Betting (wybór projektów)', 'Building (6-tygodniowy cykl)', 'Cool-down (2 tygodnie przerwy)'],
        artifacts: ['Pitch', 'Breadboard', 'Fat Marker Sketches', 'Hill Chart'],
        whenToUse: 'Samozarządzające się zespoły z dużym zaufaniem zarządu; ratunek dla nieskończonych sprintów Scrum.',
        limitations: 'Nieskuteczne w kulturach "command & control", agencjach z zamkniętymi zakresami, Sales-led growth.',
        aiAutomation: 'no',
        complexity: 4,
        cycleDuration: '6 tygodni',
        imageUrl: '/assets/frameworks/shape_up.png',
        examples: [
            'Basecamp — rygorystyczne apetyty 6-tygodniowe dla wszystkich nowych funkcjonalności',
            'Figma team — użycie "fat marker sketches", aby uniknąć przywiązania do pikseli zbyt wcześnie',
            'Autonomic team — eliminacja backlogu na rzecz "betting table" z jasnymi pitchami'
        ]
    },
    // ── Frameworki problemowe ─────────────────────────────────────────────────
    {
        id: 'jtbd',
        category: 'problem',
        name: 'Jobs-To-Be-Done',
        shortName: 'JTBD / ODI',
        author: 'Clayton Christensen / Anthony Ulwick / Bob Moesta',
        assumption: 'Klienci nie kupują produktów, lecz "wynajmują" je do wykonania konkretnej pracy (zdobycia postępu) w określonym kontekście.',
        phases: ['Zdefiniowanie rynku i zadania', 'Mapowanie pracy (Job Map)', 'Zebranie oczekiwanych rezultatów (Desired Outcomes)', 'Identyfikacja nisz (Opportunity Algorithm)'],
        artifacts: ['Job Map', 'Outcome Statements', 'Job Stories'],
        whenToUse: 'Gdy firma utknęła w "feature parity" i potrzebuje odkryć nowe rynki.',
        limitations: 'Klasyczne ODI jest ekstremalnie pracochłonne i wymaga ciężkich badań ilościowych i jakościowych.',
        aiAutomation: 'partial',
        complexity: 5,
        cycleDuration: 'tygodnie–miesiące',
        imageUrl: '/assets/frameworks/jtbd.png',
        examples: [
            'Snickers — repozycjonowanie batona z "słodyczy" na "szybką przekąskę nasycającą głód na 2h"',
            'Milkshake McDonald\'s — odkrycie, że rano shake "zatrudniany" jest by zająć czas w korku',
            'Intercom — redukcja setek funkcji do kilku opartych ściśle na zadaniach komunikacyjnych'
        ]
    },
    {
        id: 'problem-framing',
        category: 'problem',
        name: 'Problem / Opportunity Framing',
        author: 'Jeff Patton / Design Thinking',
        assumption: 'Sposób, w jaki zespół zdefiniuje ramy problemu, determinuje potencjalne rozwiązania. Wymaga wyrównania wiedzy z interesariuszami.',
        phases: ['Problem Identification (bez narzucania rozwiązania)', 'User Identification (kto odczuwa ból?)', 'Assessing the Opportunity (biznes + strategia)'],
        artifacts: ['Problem Brief Worksheet', 'Problem Statement'],
        whenToUse: 'Na starcie inicjatywy, by zsynchronizować interesariuszy i zespół developerski.',
        limitations: 'Zbyt wąskie obramowanie problemu całkowicie zamyka ścieżkę do innowacji.',
        aiAutomation: 'partial',
        complexity: 2,
        cycleDuration: 'dni',
        imageUrl: '/assets/frameworks/problem_framing.png',
        examples: [
            'Wolny wentylator — zamiast "Jak przyspieszyć wirnik?", zapytano "Jak lepiej chłodzić użytkownika?"',
            'Netflix — redefinicja problemu z "wypożyczalni DVD" na "rozrywka w domowym zaciszu"',
            'IDEO Shopping Cart — przeformułowanie problemu złodziei wózków na problem wygody zakupów'
        ]
    },
    {
        id: 'five-whys',
        category: 'problem',
        name: '5 Whys + Fishbone',
        shortName: 'RCA',
        author: 'Kaoru Ishikawa / Lean Manufacturing',
        assumption: 'Skuteczne rozwiązanie to usunięcie głębokiej przyczyny źródłowej błędu systemowego, ukrytej za obserwowanymi symptomami.',
        phases: ['Mapowanie przyczyn (Fishbone diagram — 6M)', 'Pętla 5 Whys drążąca gałęzie problemu'],
        artifacts: ['Diagram Ishikawy (Fishbone Diagram)', 'Raport RCA'],
        whenToUse: 'Przy głębokiej analizie churnu, defektach produktowych, nieoczekiwanym blokowaniu przepływu użytkowników.',
        limitations: 'Metoda liniowa; nie sprawdza się przy problemach z wieloma nakładającymi się przyczynami.',
        aiAutomation: 'partial',
        complexity: 2,
        cycleDuration: 'godziny–dni',
        imageUrl: '/assets/frameworks/five_whys.png',
        examples: [
            'Toyota — odkrycie, że częste awarie maszyny wynikają z braku filtra na pompie oleju, a nie błędu operatora',
            'Amazon — redukcja czasu ładownia strony poprzez odkrycie błędu w skrypcie zewnętrznej analityki',
            'B2B SaaS — "Dlaczego klienci odchodzą?" drążone aż do zidentyfikowania nieintuicyjnego onboardingu'
        ]
    },
    {
        id: 'cjm',
        category: 'problem',
        name: 'Customer Journey Mapping',
        shortName: 'CJM',
        author: 'Service/UX Design',
        assumption: 'Holistyczna analiza wizualna doświadczeń użytkownika ujawnia "dziury" na punktach styku (touchpoints) powodujące frustrację.',
        phases: ['Zdefiniowanie Persony i Scenariusza', 'Mapowanie Touchpoints', 'Analiza sentymentu i bólu (Pain Points)', 'Identyfikacja Szans'],
        artifacts: ['Customer Journey Map', 'Empathy Map', 'Service Blueprint'],
        whenToUse: 'Optymalizacja procesu zakupowego, ratowanie konwersji przy onboardingu, budowanie empatii zespołu.',
        limitations: 'Ryzyko tworzenia ładnych grafik bez pokrycia w danych, które stają się martwym dokumentem.',
        aiAutomation: 'yes',
        complexity: 2,
        cycleDuration: 'dni–tygodnie',
        imageUrl: '/assets/frameworks/cjm.png',
        examples: [
            'Airbnb — legendarna oś czasu doświadczeń gości zidentyfikowała, że powitanie to najważniejszy element',
            'IKEA — mapowanie ścieżki sklepowej, od parkingu aż po lody przy kasie',
            'Uber — minimalizacja frustracji na stykach oczekiwania poprzez grę psychologiczną w aplikacji'
        ]
    },
    // ── Modele walidacji ──────────────────────────────────────────────────────
    {
        id: 'pretotyping',
        category: 'validation',
        name: 'Pretotyping',
        author: 'Alberto Savoia (Google)',
        assumption: '"Upewnij się, że budujesz Właściwą Rzecz (Right It), zanim zbudujesz ją właściwie (Build it right)". Dane wygrywają z opiniami (Data beats opinion).',
        phases: [
            'Sformułowanie hipotezy rynkowej (XYZ hypothesis)',
            'Wybór techniki pretotypu (Fake Door, Facade, Mechanical Turk...)',
            'Wyznaczenie kryterium ILI (Initial Level of Interest)',
            'Zebranie twardych danych YODA z "Skin in the Game"',
            'Kalkulacja wyniku punktowego i decyzja',
        ],
        artifacts: ['YODA Data (Your Own Data)', 'ILI/OLI Chart', 'Landing Page (Fake Door)', 'XYZ Hypothesis'],
        whenToUse: 'Najwcześniejsze fazy ideacji, gdy mamy tylko założenie o potrzebie i chcemy zbie rać twarde dane bez pisania linijki kodu.',
        limitations: 'Może nadwężyć markę przy technikach Fake Door; nie sprawdza ryzyka technicznego (Feasibility).',
        aiAutomation: 'partial',
        complexity: 1,
        cycleDuration: 'dni',
        techniques: [
            {
                name: 'Fake Door',
                icon: '🚪',
                description: 'Tworzenie punktu wejścia dla produktu/funkcji które jeszcze nie istnieją (np. reklama, przycisk zakupowy). Mierzy odsetek osób, które faktycznie próbują dokonać zakupu.',
            },
            {
                name: 'Facade (Fasada)',
                icon: '🎭',
                description: 'Testowanie produktu wyglądającego w pełni funkcjonalnie, podczas gdy cała obsługa odbywa się ręcznie. Np. sprzedaż online realizowana ręcznie w tle.',
            },
            {
                name: 'Mechanical Turk',
                icon: '⚙️',
                description: 'Zastąpienie drogiej technologii żywym człowiekiem działającym w ukryciu. Klasyczny przykład: IBM testował speech-to-text z maszynistką w sąsiednim pokoju.',
            },
            {
                name: 'Pinocchio',
                icon: '🧸',
                description: 'Stworzenie całkowicie niefunkcjonalnego fizycznego odpowiednika produktu (np. drewniany klocek zamiast palmtopa). Bada ergonomię i kontek st użycia.',
            },
            {
                name: 'Provincial',
                icon: '🌾',
                description: 'Przetestowanie produktu w bardzo małym, nieformalnym środowisku (np. na parkingu przed sklepem). Oszczędza koszty infrastruktury, daje twarde dane z pierwszej ręki.',
            },
            {
                name: 'Infiltrator',
                icon: '🕵️',
                description: 'Podrzu cenie własnych prototypów na półki w istniejącym (cudzym) sklepie, aby sprawdzić czy klienci chwycą i zapłacą za nowy produkt.',
            },
        ],
        imageUrl: '/assets/frameworks/pretotyping.png',
        examples: [
            'IBM — symulacja rozpoznawania mowy na komputerze za pomocą sekretarki w pokoju obok (Mechanical Turk)',
            'McDonald\'s — rysowanie interfejsu kiosku zamawiającego kredą na podłodze (Pinocchio)',
            'CarsDirect — ręczne kupowanie aut u dealera po zadeklarowaniu zakupu przez klienta na prostej stronie WWW (Facade)'
        ]
    },
    {
        id: 'experiment-canvas',
        category: 'validation',
        name: 'Experiment Canvas',
        author: 'Strategyzer / Design a Better Business',
        assumption: 'Narzuca naukowe ramy weryfikacji hipotez biznesowych, uniemożliwiając ignorowanie twardych kryteriów.',
        phases: ['Definicja hipotezy ("Wierzymy, że...")', 'Wskazanie najryzykowniejszego założenia (Riskiest Assumption)', 'Ustalenie kryterium sukcesu (Metrics & Target)', 'Egzekucja + wnioski + decyzje'],
        artifacts: ['Wypełniony Experiment Canvas', 'Test Log'],
        whenToUse: 'Zawsze przed eksperymentami rynkowymi, testami A/B lub wypuszczeniem MVP.',
        limitations: 'Łatwo ugrzęznąć w testowaniu nieistotnych detali zamiast ryzyk u podstaw modelu.',
        aiAutomation: 'yes',
        complexity: 2,
        cycleDuration: 'dni–tygodnie',
        examples: [
            'Nespresso — projektowanie testów weryfikujących gotowość klientów B2B do opłacenia miesięcznej subskrypcji za ekspresy',
            'Zapier — testy sprawdzające czy użytkownicy są w stanie samodzielnie zbudować swojego pierwszego "Zapa"',
            'Fintech App — weryfikacja za pomocą prostego landing page\'a czy młodzi użytkownicy podadzą PESEL na wczesnym etapie onboardingu'
        ]
    },
    // ── Narzędzia rynkowe ─────────────────────────────────────────────────────
    {
        id: 'osint',
        category: 'market',
        name: 'OSINT-driven Discovery',
        shortName: 'OSINT',
        author: 'Ogólna metodologia cyber/business intel',
        assumption: 'Ogólnodostępne dane (social media, metadane, bazy patentów) stanowią kopalnię wiedzy o wektorach ataków na pozycję konkurencji.',
        phases: ['Google Dorking (odkrywanie ukrytych specs)', 'Analiza metadanych narzędzi', 'Social Listening i ekstrakcja sentymentów'],
        artifacts: ['Raport wywiadowczy', 'Mapa luk technologicznych'],
        whenToUse: 'Eksploracja nasyconych rynków; budowanie strategii przewagi technologicznej.',
        limitations: 'Ogromny szum informacyjny; ryzyko analizy niekompletnych danych prowadzące do błędnych założeń.',
        aiAutomation: 'yes',
        complexity: 3,
        cycleDuration: 'godziny–dni',
        imageUrl: '/assets/frameworks/osint.png',
        examples: [
            'HubSpot — skrobanie recenzji Capterra/G2 konkurencji w celu wychwycenia powtarzających się skarg na brak specyficznych integracji',
            'B2B Sales Tool — analiza ofert pracy konkurencji na LinkedIn by przewidzieć ich nową strategię',
            'SaaS Startup — śledzenie wzmianek "szukam alternatywy dla X" na Reddicie i Twitterze'
        ]
    },
    {
        id: 'voc',
        category: 'market',
        name: 'Voice of Customer',
        shortName: 'VoC',
        author: 'Gainsight / Productboard',
        assumption: 'Skoncentrowane, wielokanałowe zbieranie i analiza feedbacku od klientów pozwala priorytetyzować prace oparte na realnych bolączkach.',
        phases: ['Listen (zbieranie kanałów: CSAT, NPS, bilety wsparcia)', 'Analyze (wydobycie powtarzających się motywów)', 'Act (wdrożenie do roadmapy)'],
        artifacts: ['Centralne Repozytorium Zgłoszeń', 'Dashboard sentymentów'],
        whenToUse: 'Przez cały cykl życia produktu jako system wczesnego ostrzegania o problemach z adopcją.',
        limitations: '"Klątwa głośnego klienta" — głośni użytkownicy mogą zniekształcić obraz potrzeb cichej większości.',
        aiAutomation: 'yes',
        complexity: 3,
        cycleDuration: 'ciągły',
        imageUrl: '/assets/frameworks/voc.png',
        examples: [
            'Slack — utrzymywanie publicznego Trello z requestami użytkowników i rygorystyczne reagowanie na skargi tekstowe',
            'Superhuman — systematyczna kategoryzacja zapytań mailowych pod kątem głównego Product-Market Fit',
            'Starbucks — program "My Starbucks Idea" gromadzący innowacje bezpośrednio od kupujących kawę'
        ]
    },
    // ── Artefakty ─────────────────────────────────────────────────────────────
    {
        id: 'north-star',
        category: 'artifact',
        name: 'North Star Metric',
        shortName: 'NSM',
        author: 'Sean Ellis / Amplitude',
        assumption: 'Znalezienie jednej strategicznej metryki tworzącej wartość dla klienta i odpowiadającej celom biznesowym wyznacza azymut dla całej firmy.',
        phases: ['Ustalenie gry (Attention / Transaction / Productivity)', 'Zdefiniowanie NSM', 'Rozbicie NSM na 3–5 Input Metrics'],
        artifacts: ['Metric Tree', 'North Star Dashboard'],
        whenToUse: 'Produkty PLG dążące do głębokiego zaangażowania; ujednolicenie działań cross-funkcjonalnych zespołów.',
        limitations: 'Źle zdefiniowana NSM (jako vanity metric np. ARPU) prowadzi do patologii optymalizacyjnych.',
        aiAutomation: 'partial',
        complexity: 3,
        cycleDuration: 'kwartał',
        imageUrl: '/assets/frameworks/nsm.png',
        examples: [
            'Spotify — Czas spędzony na słuchaniu muzyki (nie liczba logowań)',
            'Airbnb — Liczba zarezerwowanych nocy (nie liczba wyszukań kwater)',
            'Miro — Liczba tablic kolaboracyjnych z przynajmniej 2 aktywnymi edytorami tygodniowo'
        ]
    },
    {
        id: 'ost',
        category: 'artifact',
        name: 'Opportunity Solution Tree',
        shortName: 'OST',
        author: 'Teresa Torres',
        assumption: 'Drzewo łączy nadrzędny cel biznesowy z szansami rynkowymi i rozwiązaniami, zapobiegając "zakochiwaniu się" w jednym pomyśle.',
        phases: ['Desired Outcome (metryka behawioralna)', 'Opportunities (szanse z wywiadów)', 'Solutions (pomysły produktowe)', 'Assumption Tests'],
        artifacts: ['OST w Miro/FigJam', 'Rejestr logów testowych'],
        whenToUse: 'Główne narzędzie w metodologii Continuous Discovery.',
        limitations: 'Łatwo zbudować drzewo na wyssanych z palca założeniach; przerośnięte drzewo traci czytelność.',
        aiAutomation: 'yes',
        complexity: 4,
        cycleDuration: 'ciągły',
        imageUrl: '/assets/frameworks/ost.png',
        examples: [
            'Zwiększenie retention użytkowników o 15% w ciągu kwartału',
            'Optymalizacja procesu checkoutu dla użytkowników mobilnych',
            'Wprowadzenie systemu rekomendacji AI dla platformy e-commerce'
        ]
    },
    {
        id: 'hmw',
        category: 'artifact',
        name: 'How Might We',
        shortName: 'HMW',
        author: 'IDEO / d.school / Design Sprint',
        assumption: 'Przekształcenie sztywnego opisu problemu w otwarte pytanie "Jak moglibyśmy..." odblokowuje kreatywność na fazie ideacji.',
        phases: ['Zdefiniowanie Problem Statement', 'Ekstrakcja bólu klienta', 'Transformacja w HMW statement'],
        artifacts: ['Zestaw kartek HMW', 'Problem Brief'],
        whenToUse: 'Przejście z fazy Define (konwergencja) do fazy Develop/Ideate (dywergencja).',
        limitations: 'Zbyt ogólne HMW prowadzi do mętnego brainstormingu, zbyt wąskie narzuca wynik.',
        aiAutomation: 'yes',
        complexity: 1,
        cycleDuration: 'godziny',
        imageUrl: '/assets/frameworks/hmw.png',
        examples: [
            '"Jak moglibyśmy pomóc pasażerom spędzić czas na lotnisku bardziej produktywnie?"',
            '"Jak moglibyśmy sprawić, by zakładanie konta bankowego było tak łatwe jak logowanie do Netflixa?"',
            '"Jak moglibyśmy wykorzystać czas spędzany w korkach do nauki języków?"'
        ]
    },
    {
        id: 'user-story-mapping',
        category: 'artifact',
        name: 'User Story Mapping',
        shortName: 'USM',
        author: 'Jeff Patton',
        assumption: 'Liniowe backlogi gubią kontekst. Układanie funkcji wg ścieżki użytkownika (X) i ważności (Y) pozwala dostarczyć produkt, który ma sens.',
        phases: ['The Backbone (główne działania użytkownika)', 'The Ribs (User Stories pionowo)', 'Releases (poziome odcięcia określające MVP)'],
        artifacts: ['Visual User Story Map', 'Release Plan'],
        whenToUse: 'Gdy deweloperzy tracą "Big Picture"; idealne na starcie planowania MVP.',
        limitations: 'Fizyczne mapy trudne w utrzymaniu dla rozproszonych zespołów; bez aktualizacji stają się reliktem.',
        aiAutomation: 'partial',
        complexity: 3,
        cycleDuration: 'dni–tygodnie',
        imageUrl: '/assets/frameworks/usm.png',
        examples: [
            'Slack — ułożenie MVP komunikatora poprzez odcięcie wszystkich funkcji poza "wyślij wiadomość"',
            'E-commerce — wizualizacja kroków kupującego i decyzja o odłożeniu "wishlisty" na Release 2',
            'SaaS App — dekompozycja skomplikowanego onboardingu na małe etapy rozwijane iteracyjnie'
        ]
    },
    // ── Priorytetyzacja ───────────────────────────────────────────────────────
    {
        id: 'moscow',
        category: 'prioritization',
        name: 'MoSCoW Method',
        author: 'Dai Clegg / DSDM Consortium (1994)',
        assumption: 'Nie wszystkie wymagania mają równą wartość. Podział na Must/Should/Could/Won\'t pozwala w 30 minut uzgodnić zakres MVP bez wielogodzinnych negocjacji.',
        phases: [
            'Must Have — krytyczne, bez nich produkt nie działa lub nie spełnia wymogów prawnych. Maksymalnie 60% pracy w iteracji.',
            'Should Have — ważne, ale da się bez nich żyć do następnego release. Dostarczyć jeśli czas pozwoli.',
            'Could Have — nice-to-have, pierwsze do odcięcia gdy pojawi się presja czasowa.',
            'Won\'t Have (this time) — explicite odrzucone NA TEN CYKL. "Parking lot" — wrócimy do nich.',
        ],
        artifacts: ['MoSCoW Backlog', 'Release Scope Agreement', 'Won\'t List (Parking Lot)'],
        whenToUse: 'Planowanie zakresu MVP, negocjowanie sprint scope ze stakeholderami, kick-off projektu gdy wszyscy chcą wszystkiego.',
        limitations: 'Silnie subiektywne — bez procesu każdy stakeholder upycha swoje potrzeby w "Must". Nie uwzględnia kosztu realizacji. Ryzyko "scope creep" gdy "Could Have" lista rośnie.',
        aiAutomation: 'partial',
        complexity: 1,
        cycleDuration: 'godziny–dni',
        examples: [
            'Fintech MVP — Must: przelew, logowanie, saldo. Should: historia. Could: dark mode. Won\'t: kryptowaluty.',
            'Sprint planning — PM prowadzi sesję 30 min z 5 stakeholderami, wspólnie kategoryzują 20 ticketów.',
            'E-commerce — Must: koszyk + płatność. Could: wishlist, recenzje, rekomendacje → Release 2.',
        ]
    },
    {
        id: 'rice',
        category: 'prioritization',
        name: 'RICE Score',
        shortName: 'RICE',
        author: 'Intercom — Sean McBride (2016)',
        assumption: 'Reach × Impact × Confidence / Effort daje porównywalną liczbę dla każdej inicjatywy, eliminując "HiPPO Effect" (Highest Paid Person\'s Opinion) z priorytetyzacji.',
        phases: [
            'Reach — ile userów dotknie w ciągu kwartału? Licz MAU/sessions, nie "registered users". Preferuj revenue-at-risk gdy brak danych.',
            'Impact — jak mocno zmienia key metric? Skala: 0.25=minimal / 0.5=low / 1=medium / 2=high / 3=massive.',
            'Confidence — jak pewny jesteś szacunków? 20%=hipoteza / 50%=sygnały z wywiadów / 80%=dane z produkcji. NIGDY powyżej 80% bez danych z działającego MVP.',
            'Effort — person-months. Zawsze dodaj +40% na code review, integracje, edge cases.',
            'RICE = (R × I × C) / E → sortuj backlog malejąco. RICE <1.0: odrzuć. 1–5: oceń strategicznie. >5: priorytet.',
        ],
        artifacts: ['RICE Scored Backlog', 'Prioritized Feature List', 'Quarterly Roadmap'],
        whenToUse: 'Kwartalne planowanie roadmapy, porównywanie featureów o różnej skali, gdy PM musi uzasadnić priorytetyzację przed zarządem lub inwestorami.',
        limitations: 'Garbage in, garbage out — subiektywne szacunki dają fałszywe poczucie obiektywności. Nie uwzględnia zależności między featurami ani ryzyka strategicznego. Confidence jest nagminnie zawyżana.',
        aiAutomation: 'yes',
        complexity: 2,
        cycleDuration: 'godziny–dni',
        examples: [
            'Onboarding checklist: Reach=5000, Impact=2, Confidence=80%, Effort=0.5 → RICE=16. Top priority.',
            'Dark mode: Reach=8000, Impact=0.25, Confidence=50%, Effort=1.5 → RICE=0.67. Odrzuć.',
            'Intercom — zastąpienie gut-feeling arkuszem RICE zmniejszyło czas planowania roadmapy o 40%.',
        ]
    },
    {
        id: 'ice-score',
        category: 'prioritization',
        name: 'ICE Score',
        shortName: 'ICE',
        author: 'Sean Ellis — GrowthHackers (2015)',
        assumption: 'W growth hackingu liczy się szybkość iteracji. ICE (Impact × Confidence × Ease) to heurystyka pozwalająca zrankować dziesiątki pomysłów w minuty bez paraliżu analitycznego.',
        phases: [
            'Impact (1–10) — jak duży efekt na cel (np. activation rate)? Oprzyj na danych, nie intuicji.',
            'Confidence (1–10) — skąd wiesz, że zadziała? 10 = masz dane z A/B testu. 1 = czyste zgadywanie.',
            'Ease (1–10) — jak łatwe do wdrożenia? 10 = zmiana tekstu. 1 = 3 miesiące Engu.',
            'ICE = I × C × E → max 1000 pkt. Sortuj i testuj od góry.',
        ],
        artifacts: ['ICE Scored Experiment Queue', 'Growth Backlog', 'Weekly Sprint Test List'],
        whenToUse: 'Growth teams, hackathony, rapid experimentation — gdy masz >20 hipotez i musisz wybrać co testować w tym tygodniu.',
        limitations: 'Wysoce subiektywny bez kalibracji między członkami zespołu. Ease może faworyzować szybkie, małe testy kosztem dużych inicjatyw strategicznych. Nadaje się do filtrowania, nie do precyzyjnej roadmapy.',
        aiAutomation: 'yes',
        complexity: 1,
        cycleDuration: 'godziny',
        examples: [
            'CTA button copy change: I=7, C=8, E=9 → ICE=504. Start immediately.',
            'Nowy onboarding flow: I=9, C=4, E=3 → ICE=108. Wróć gdy masz więcej danych.',
            'Dropbox referral program: I=9, C=6, E=5 → ICE=270. Priorytet, mimo umiarkowanej łatwości.',
        ]
    },
    {
        id: 'wsjf',
        category: 'prioritization',
        name: 'WSJF — Weighted Shortest Job First',
        shortName: 'WSJF',
        author: 'Don Reinertsen / SAFe — Scaled Agile',
        assumption: 'Optymalny wybór kolejności pracy maksymalizuje "Cost of Delay" podzielony przez czas realizacji. Prosta zasada: krótka praca o wysokim koszcie opóźnienia zawsze idzie pierwsza.',
        phases: [
            'User-Business Value (1–10) — ile traci biznes/klient gdy to opóźnimy?',
            'Time Criticality (1–10) — czy jest deadline, sezonowość lub okno rynkowe?',
            'Risk Reduction / Opportunity Enablement (1–10) — czy odblokuje inne prace lub zredukuje ryzyko?',
            'Cost of Delay = User Value + Time Criticality + Risk Reduction',
            'Job Size (1–10, relative) — rozmiar pracy (jak story points, relative do innych)',
            'WSJF = Cost of Delay / Job Size → sortuj backlog malejąco.',
        ],
        artifacts: ['WSJF Scored Backlog', 'Program Increment (PI) Backlog', 'Portfolio Kanban'],
        whenToUse: 'Portfolio management w SAFe, priorytetyzacja epiców i featureów między zespołami, gdy zespoły rywalizują o ograniczone zasoby inżynierskie.',
        limitations: 'Cost of Delay trudny do kwantyfikacji bez danych historycznych. Wymaga kalibracji między zespołami (relative sizing). Może faworyzować "łatwe" prace kosztem strategicznie ważnych inicjatyw długoterminowych.',
        aiAutomation: 'partial',
        complexity: 3,
        cycleDuration: 'dni–tygodnie',
        examples: [
            'Feature compliance (deadline ustawowy) + niska złożoność → WSJF=wysoki → natychmiast.',
            'SAFe PI Planning — 3 zespoły rankują 15 epiców wspólnie używając WSJF w 2 godziny.',
            'Spotify — priorytetyzacja cross-team backlogu: regulatory feature wyprzedza nową funkcję discovery.',
        ]
    },
    {
        id: 'kano',
        category: 'prioritization',
        name: 'Kano Model',
        author: 'Noriaki Kano — Tokyo University of Science (1984)',
        assumption: 'Nie wszystkie cechy wpływają tak samo na satysfakcję. Must-Be (brak = katastrofa), Performance (więcej = lepiej), Attractive (niespodziewana radość) — klasyfikacja determinuje co budować, a co jest "table stakes".',
        phases: [
            'Przygotuj listę 10–20 cech do oceny przez klientów.',
            'Dla każdej cechy zadaj DWA pytania: funkcjonalne ("Jak byś się czuł gdyby TO BYŁO?") i dysfunkcjonalne ("Jak byś się czuł gdyby TEJ FUNKCJI NIE BYŁO?").',
            'Skategoryzuj odpowiedzi wg tabeli Kano: Must-Be / Performance / Attractive / Indifferent / Reverse.',
            'Must-Be najpierw (bez negocjacji). Performance: priorytetyzuj proporcjonalnie do wartości. Attractive: differentiatory — buduj gdy Must-Be i Performance pokryte.',
        ],
        artifacts: ['Kano Survey Results', 'Feature Classification Matrix', 'Delight/Dissatisfaction Map'],
        whenToUse: 'Roadmap planning gdy nie wiesz co różnicuje cię od konkurencji, decyzja o differentiatorach vs "table stakes", research przed dużym redesignem.',
        limitations: 'Kosztowne w realizacji (wymaga surveyu z minimum 20–30 klientami). Kategorie zmieniają się w czasie — Attractive staje się Must-Be (np. mapa offline w aplikacjach nawigacyjnych). Trudne do integracji z agile backlogiem.',
        aiAutomation: 'partial',
        complexity: 3,
        cycleDuration: 'tygodnie',
        examples: [
            'iPhone — multitouch był Attractive w 2007. Dziś jest Must-Be dla każdego smartfona.',
            'Bank mobilny — Attractive: Face ID login. Must-Be: historia transakcji, przelew. Indifferent: dark mode.',
            'Spotify — "Discover Weekly" był Attractive differentiator. Teraz każdy serwis muzyczny go ma (→ Must-Be).',
        ]
    },
    {
        id: 'value-effort',
        category: 'prioritization',
        name: 'Value vs Effort Matrix',
        shortName: '2×2 Matrix',
        author: 'Design Thinking / Agile Community',
        assumption: 'Najszybsza heurystyka priorytetyzacji: umieść każdą inicjatywę na osi Wartość (Y) × Wysiłek (X). Quick Wins zawsze idą pierwsze — dają maksymalne ROI przy minimalnym nakładzie.',
        phases: [
            'Oceń Value (relative: 1–10 lub S/M/L/XL) — ile wartości dostarcza użytkownikowi lub biznesowi?',
            'Oceń Effort (relative: 1–10 lub S/M/L/XL) — ile czasu i zasobów pochłonie?',
            'Narysuj macierz 2×2 i umieść inicjatywy: Q1 High Value + Low Effort = Quick Wins → do następnego sprintu.',
            'Q2 High Value + High Effort = Major Projects → zaplanuj starannie. Q3 Low/Low = Fill-ins. Q4 Low Value + High Effort = Avoid → odrzuć.',
        ],
        artifacts: ['2×2 Prioritization Matrix', 'Quick Wins List', 'Avoid List (waste reduction)'],
        whenToUse: 'Szybkie sesje priorytetyzacji z zespołem (30 min), warsztaty ze stakeholderami, gdy potrzebujesz konsensusu wizualnego bez skomplikowanych obliczeń.',
        limitations: 'Wysoce subiektywne — bez danych każdy widzi "Quick Wins" inaczej. Brak uwzględnienia ryzyka, strategicznego dopasowania i zależności. "Quick Win bias" może prowadzić do pomijania ważnych, trudnych inicjatyw.',
        aiAutomation: 'yes',
        complexity: 1,
        cycleDuration: 'godziny',
        examples: [
            'Stacja Robocza — Quick Win: dodaj skróty klawiszowe (1 dzień, +15% retention). Major: rewrite architektury.',
            'E-commerce — Quick Win: zmień CTA z "Kup" na "Dodaj do koszyka" (+8% konwersja, 2h dev).',
            'SaaS Sprint Planning — zespół 6 osób kategoryzuje 25 ticketów w 45 minut, konsensus wizualny na tablicy.',
        ]
    },
    {
        id: 'buy-a-feature',
        category: 'prioritization',
        name: 'Buy a Feature',
        author: 'Luke Hohmann — Innovation Games (2006)',
        assumption: 'Dając klientom wirtualny "budżet" do wydania na cechy produktu, ujawniasz ich prawdziwe priorytety lepiej niż jakiekolwiek ankiety — pieniądze (nawet wirtualne) wymuszają autentyczne decyzje trade-off.',
        phases: [
            'Przygotuj listę 15–20 featureów z "cenami" proporcjonalnymi do kosztu realizacji (droższe = trudniejsze).',
            'Daj każdemu uczestnikowi budżet równy ok. 1/3 sumy cen wszystkich featureów (wymusza wybory).',
            'Sesja zakupów: każdy wydaje swój budżet. Niektóre drogie featureylub wymagają "zakupu grupowego" — co wywołuje dyskusję.',
            'Podlicz ile "kupiono" każdego feature → ranking realnych priorytetów klientów.',
        ],
        artifacts: ['Feature Purchase Report', 'Customer Priority Ranking', 'Validated Roadmap Input'],
        whenToUse: 'Walidacja roadmapy z klientami w panelu, sesje discovery z grupą użytkowników, gdy chcesz przebić "wszystko jest ważne" i zobaczyć prawdziwe priorytety.',
        limitations: 'Wymaga dostępu do reprezentatywnej grupy klientów (min. 8–15 osób). Ceny muszą być precyzyjnie skalibrowane. Klienci mogą grać "bezpiecznie" zamiast innovatively. Nie zastępuje ilościowych badań rynku.',
        aiAutomation: 'no',
        complexity: 2,
        cycleDuration: 'godziny–dni',
        examples: [
            'B2B SaaS — panel 12 klientów, budżet $1000 na featureylub, odkrycie że "bulk export" wygrywa z "AI recommendations".',
            'Banking App — klienci kupują "instant notifications" za $200, ignorują "virtual cards" warte $50.',
            'Innowacja grupowa: drogi feature "Real-time collaboration" wymaga zbiórki od 3 graczy → ujawnia jego realną wartość.',
        ]
    },
    // ── Metryki i wskaźniki ───────────────────────────────────────────────────
    {
        id: 'aarrr',
        category: 'metrics',
        name: 'AARRR — Pirate Metrics',
        shortName: 'AARRR',
        author: 'Dave McClure — 500 Startups (2007)',
        assumption: 'Każdy produkt cyfrowy ma 5 kluczowych etapów cyklu życia użytkownika. Identyfikacja wąskiego gardła w lejku pozwala skupić wysiłki growth na obszarze o najwyższym ROI zamiast optymalizować wszystko naraz.',
        phases: [
            'Acquisition — skąd przychodzą? CAC, kanały (SEO/Paid/Viral), UTM tracking, konwersja landing page.',
            'Activation — czy mają "Aha Moment"? Onboarding completion rate, time-to-first-value, Day 1 action completion.',
            'Retention — czy wracają? D1/D7/D30 retention, DAU/MAU ratio, churn rate, cohort analysis.',
            'Referral — czy polecają? NPS, viral coefficient (k-factor), referral program conversion, organic growth rate.',
            'Revenue — czy płacą? MRR, ARPU, LTV, LTV:CAC ratio (zdrowe >3:1), payback period.',
        ],
        artifacts: ['AARRR Funnel Dashboard', 'Cohort Analysis', 'Retention Curves', 'Channel Attribution Report'],
        whenToUse: 'Startupy i produkty PLG szukające growth levers, diagnoza "gdzie tracimy użytkowników", kwartalny przegląd growth team, priorytetyzacja eksperymentów.',
        limitations: 'Model liniowy — nie odzwierciedla złożonych, nielinearnych ścieżek użytkownika ani B2B z długim sales cycle. Kolejność liter myląca: Retention jest ważniejsza od Acquisition (Dave McClure sam zaproponował RARRA jako poprawkę).',
        aiAutomation: 'yes',
        complexity: 2,
        cycleDuration: 'ciągły',
        examples: [
            'Dropbox — bottleneck w Activation (install→sync first file): naprawienie onboardingu +60% activation.',
            'Slack — viral loop przez Referral: każdy nowy user zapraszał średnio 4 osoby (k-factor=1.4 → growth bez Paid Acquisition).',
            'SaaS — D30 retention 15% → priorytet na Retention, nie Acquisition. Więcej userów do "dziurawego wiadra" nie pomaga.',
        ]
    },
    {
        id: 'heart',
        category: 'metrics',
        name: 'HEART Framework',
        author: 'Kerry Rodden, Hilary Hutchinson, Xin Fu — Google (2010)',
        assumption: 'Metryki UX muszą mierzyć doświadczenie w 5 wymiarach (Happiness, Engagement, Adoption, Retention, Task Success), a nie tylko konwersje. Struktura Goals→Signals→Metrics eliminuje vanity metrics.',
        phases: [
            'Happiness — subiektywna satysfakcja: CSAT, NPS, SUS score, App Store rating. "Czy użytkownicy LUBIĄ produkt?"',
            'Engagement — głębokość użytkowania: session frequency, DAU/MAU, features per session, depth of interaction.',
            'Adoption — czy nowi userzy wdrożyli kluczowe funkcje? New user activation rate, feature adoption curve.',
            'Retention — czy wracają w czasie? Cohort retention, churn rate, resurrection rate (powrót po odejściu).',
            'Task Success — czy osiągają cel? Completion rate, error rate, time-on-task, learnability index.',
        ],
        artifacts: ['HEART Goals/Signals/Metrics Table', 'UX Scorecard', 'Quarterly UX Review', 'GSM (Goals-Signals-Metrics) Doc'],
        whenToUse: 'Mierzenie jakości produktu z perspektywy UX, pre/post redesign comparison, gdy NPS i conversion rate nie oddają pełnego obrazu doświadczenia użytkownika.',
        limitations: 'Happiness trudna do ciągłego mierzenia (wymaga aktywnych badań). Nie zastępuje metryk biznesowych (MRR, churn). Ryzyko mierzenia wszystkich 5 wymiarów naraz — lepsza koncentracja na 2–3 priorytetowych.',
        aiAutomation: 'partial',
        complexity: 3,
        cycleDuration: 'kwartał',
        examples: [
            'Google Maps redesign — HEART pokazał: Task Success wzrósł o 20%, ale Happiness spadło (zbyt dużo zmian naraz).',
            'Gmail — Adoption nowego Compose mierzony oddzielnie dla power users vs casual: różne progi sukcesu.',
            'SaaS Dashboard — Engagement: avg. 2.1 features/session (baseline), cel Q2: 3.5 → kieruje roadmapę na cross-feature discovery.',
        ]
    },
    {
        id: 'omtm',
        category: 'metrics',
        name: 'OMTM — One Metric That Matters',
        shortName: 'OMTM',
        author: 'Alistair Croll & Benjamin Yoskovitz — Lean Analytics (2013)',
        assumption: 'W każdej fazie produktu istnieje jedna metryka ważniejsza od wszystkich innych. Fokus całego zespołu na jednej liczbie eliminuje "dashboard theater" i zapobiega rozproszeniu uwagi.',
        phases: [
            'Zidentyfikuj aktualną fazę produktu: Empathy (czy problem jest realny?) → Stickiness (czy wracają?) → Virality (czy polecają?) → Revenue (czy płacą?) → Scale (jak rosnąć?).',
            'Dobierz OMTM do fazy: Empathy=interviews/week. Stickiness=D7 retention. Virality=k-factor. Revenue=MRR. Scale=CAC.',
            'Ustaw konkretny cel i timeframe: "Zwiększ D7 retention z 25% do 40% w Q2".',
            'Cały team raportuje, eksperymentuje i priorytetyzuje wyłącznie pod tę jedną metrykę.',
            'Po osiągnięciu targetu → zmień OMTM na metrykę kolejnej fazy.',
        ],
        artifacts: ['OMTM Dashboard (1 metryka + 3–5 supporting)', 'Phase→Metric Roadmap', 'Weekly Metric Review'],
        whenToUse: 'Wczesne startupy, nowe produkty lub funkcje, gdy zespół gubi się w morzu dashboardów, OKR planning, piątki ze wszystkimi "priorytetami jednocześnie".',
        limitations: 'Goodhart\'s Law: "When a measure becomes a target, it ceases to be a good measure." Optymalizacja OMTM kosztem innych ważnych obszarów. Wybór złej OMTM dla fazy = kwartały zmarnowanego wysiłku. Nie działa przy złożonych B2B z wieloma segmentami.',
        aiAutomation: 'partial',
        complexity: 2,
        cycleDuration: 'kwartał / faza produktu',
        examples: [
            'Airbnb (Stickiness phase) — OMTM: "Liczba nocy zarezerwowanych przez powracających hostów" (nie nowi userzy).',
            'Facebook early growth — OMTM: "7 znajomych w 10 dni" jako proxy dla długoterminowej retencji.',
            'B2B SaaS (Revenue phase) — OMTM: "MRR z klientów z onboardingiem >30 dni" eliminuje "leaky bucket" problem.',
        ]
    },
    {
        id: 'input-metrics',
        category: 'metrics',
        name: 'Input Metrics Tree',
        shortName: 'IMT',
        author: 'Amazon — Working Backwards (Jeff Bezos)',
        assumption: 'Output metrics (przychód, churn) mówią co się stało — Input metrics mówią dlaczego i co TERAZ zrobić. Drzewo przyczynowo-skutkowe od North Star do konkretnych działań zespołu eliminuje opóźnienie między akcją a wynikiem.',
        phases: [
            'Zdefiniuj Output Metric (North Star) — np. "Weekly Active Users paying > $50/mo".',
            'Rozłóż na 3–5 Input Metrics pierwszego poziomu: Acquisition Rate + Activation Rate + Revenue per Activated User.',
            'Dla każdej Input Metric rozłóż na Input Metrics drugiego poziomu (co na nią wpływa?).',
            'Przypisz każdemu liściu drzewa team/owner i konkretną akcję produktową lub operacyjną.',
            'Monitoruj input metrics tygodniowo — zmieniają się PRZED output metrics, dając czas na reakcję.',
        ],
        artifacts: ['Metric Tree (Miro/FigJam)', 'Weekly Input Dashboard', 'Team Metric Ownership Map'],
        whenToUse: 'Kwartalny OKR planning, gdy NSM nie przekłada się na działania zespołów, post-mortem dlaczego przychód spadł, alignment cross-team.',
        limitations: 'Budowanie drzewa wymaga głębokiej znajomości przyczynowości w produkcie. Ryzyko wyboru pozornych korelacji zamiast prawdziwych przyczyn. Zbyt rozbudowane drzewo (>3 poziomy) traci czytelność. Wymaga danych by walidować zależności.',
        aiAutomation: 'yes',
        complexity: 4,
        cycleDuration: 'kwartał',
        examples: [
            'Amazon — NSM: "Items sold". Input L1: Selection × Availability × Price × Convenience. Każdy team owni jeden liść.',
            'Spotify — NSM: "Czas słuchania". Input: Playlist saves + Search-to-play rate + Notification CTR.',
            'B2B SaaS — churn wzrósł: Input metrics pokazały spadek "feature adoption D30" → root cause w onboardingu, nie w cenach.',
        ]
    },
]

export const CATEGORIES = {
    cycle: { label: 'Cykle i procesy', color: '#8B5CF6' },
    problem: { label: 'Frameworki problemowe', color: '#F97316' },
    validation: { label: 'Modele walidacji', color: '#14B8A6' },
    market: { label: 'Analiza rynku', color: '#3B82F6' },
    artifact: { label: 'Artefakty / Output', color: '#EC4899' },
    prioritization: { label: 'Priorytetyzacja', color: '#EF4444' },
    metrics: { label: 'Metryki i wskaźniki', color: '#F59E0B' },
} as const

export const AI_LABELS = {
    yes: { label: 'Tak', color: '#14B8A6', bg: '#F0FDFA' },
    partial: { label: 'Częściowo', color: '#F97316', bg: '#FFF7ED' },
    no: { label: 'Nie', color: '#94A3B8', bg: '#F1F5F9' },
} as const
