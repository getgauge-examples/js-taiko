#Intercept Api

## With simple response body
* Respond to "https://docs.gauge.org/latest/writing-specifications.html" with "mocked specifications page"
* Navigate to "https://docs.gauge.org"
* Click an element that contains "Write Specifications"
* Assert text "mocked specifications page" exists on the page.

## With array as a response body
* Respond to "https://docs.gauge.org/latest/writing-specifications.html" with json "[\"mocked\",\"specifications\",\"page\"]"

* Navigate to "https://docs.gauge.org"
* Click an element that contains "Write Specifications"
* Assert text "[\"mocked\",\"specifications\",\"page\"]" exists on the page.

## With object as a response body
* Respond to "https://docs.gauge.org/latest/writing-specifications.html" with json "{\"name\":\"Jon\",\"age\":\"20\"}"

* Navigate to "https://docs.gauge.org"
* Click an element that contains "Write Specifications"
* Assert text "{\"name\":\"Jon\",\"age\":\"20\"}" exists on the page.