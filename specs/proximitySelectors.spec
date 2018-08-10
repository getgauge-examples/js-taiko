# Proximity Selectors
## Below

* Navigate to "https://gauge.org"
* Click link "Gauge Commmands" below 

   |Type|Selector|
   |----|--------|
   |link|Roadmap |

## Near by

* Navigate to "google.com"
* Click "I'm Feeling Lucky"
* Click "About"
* Select "हिन्दी" of Combo Box near 

   |Type      |Selector                        |
   |----------|--------------------------------|
   |inputField|{"placeholder":"Search Doodles"}|
* Click "Doodles संग्रह"

## Above

* Navigate to "https://gauge.org"
* Click link "Blog"
* Click image above 

   |Type|Selector       |
   |----|---------------|
   |text|Zabil Maliackal|
* Assert ok 

   |Type|Selector          |Method|
   |----|------------------|------|
   |text|Why we built Gauge|exists|

## Right Of

* Navigate to "https://gauge.org/index.html"
* Assert Exists

   |Type|Selector    |Method|
   |----|------------|------|
   |$   |.github_star|exists|
* Click link to right of

   |Type|Selector    |
   |----|------------|
   |$   |.github_star|

* Assert title to be "Supported Plugins | Gauge" 