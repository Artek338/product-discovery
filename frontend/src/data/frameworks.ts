export type AiAutomation = 'yes' | 'partial' | 'no'

export interface Framework {
    id: string
    category: 'cycle' | 'problem' | 'validation' | 'market' | 'artifact'
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
]

export const CATEGORIES = {
    cycle: { label: 'Cykle i procesy', color: '#8B5CF6' },
    problem: { label: 'Frameworki problemowe', color: '#F97316' },
    validation: { label: 'Modele walidacji', color: '#14B8A6' },
    market: { label: 'Analiza rynku', color: '#3B82F6' },
    artifact: { label: 'Artefakty / Output', color: '#EC4899' },
} as const

export const AI_LABELS = {
    yes: { label: 'Tak', color: '#14B8A6', bg: '#F0FDFA' },
    partial: { label: 'Częściowo', color: '#F97316', bg: '#FFF7ED' },
    no: { label: 'Nie', color: '#94A3B8', bg: '#F1F5F9' },
} as const
