# Handoff dla Claude Code - Product Discovery UI/UX Fixes

Poniżej znajdują się wytyczne do dalszych prac nad aplikacją "Product Discovery". Obecny UI został niedawno zrefaktoryzowany zgodnie z wytycznymi "Catalog Layout", jednak wymaga kilku istotnych poprawek i rozbudowy.

## 1. Architektura Informacji i Nawigacja (Sidebar)

* **Do usunięcia:**
  * Opcja **"Help Center"** jest zbędna i należy ją usunąć z menu.
  * Opcja **"Phase Analytics"** jest zbyteczna i ma zostać usunięta.
* **Do zrobienia / rozbudowy:**
  * **"Settings" (Ustawienia):** Obecnie opcja jest widoczna, ale nieaktywna. Należy przygotować strukturę tej sekcji oraz aktywować routing. Należy użyć dedykowanego agenta, żeby zaplanował i przygotował elementy do konfiguracji w tej sekcji.
  * **Klucz API i wybór modelu:** W aplikacji (np. w nowej sekcji Settings) musi znaleźć się miejsce na wklejenie własnego klucza do API oraz wybór modelu LLM do działania.

## 2. Internacjonalizacja (i18n)

* **Wyzwanie:** Występuje mix języków (polski i angielski) w interfejsie.
* **Rozwiązanie:** Należy ustandaryzować aplikację i wprowadzić opcję wyboru języka aplikacji. Do wyboru powinien być polski (PL) i angielski (EN).
* *Wskazówka:* Rozważ wdrożenie `react-i18next` lub prostego słownika opartego na Zustand/Context API, aby wyeliminować hardkodowane stringi.

## 3. Statystyki i Koszty

* Aplikacja powinna zawierać miejsce na wyświetlanie rozbudowanych danych statystycznych.
* Wymagane jest widoczne zaprezentowanie **kosztów zapytań do API**. Dashboard lub sekcja raportowania powinna agregować i pokazywać koszty oraz ewentualnie statystyki użycia poszczególnych modeli.

## 4. Spójność Designu z logiką

* Obecny design nie jest idealnie dostosowany do pełnych opcji aplikacji (layout był głównie skupiony na estetyce "Catalog"). Należy rozszerzyć i dopasować układ, żeby nowo dodawane funkcjonalności (ustawienia, klucze API, wybór modelu) składały się w spójną całość.
