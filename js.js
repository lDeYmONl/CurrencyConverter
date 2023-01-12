$(document).ready(function ($) {
  // Для отримання курсу валют використовується безкоштовне API https://apilayer.com/
  // Ліміт 250 запитів на місяць оскільки це безкоштовна підписка
  // Приклад запиту
  // https://apilayer.com/marketplace/exchangerates_data-api#documentation-tab

  const API = "3SM0qfTVIuZBYVnGTwGn5wvmzN60DNaP";
  //const API = "Q8IEhRp2l4FPS4ZRZ7jtk0KkIWWKSS55";

  const converterToCount = $("#converter-to__count"),
    converterFromCount = $("#converter-from__count"),
    converterFrom = $("#converter-from__currency"),
    converterTo = $("#converter-to__currency"),
    currencyListSelect = $("#currency-rate__select"),
    currencyRateList = $("#currency-rate__list");

  //Формуєм список валют
  getAllCurrencies(API);

  //Формуєм список курсів валют відносно базової валюти
  getAllCurrenciesRates(API, currencyListSelect[0].value);

  converterFromCount.on("input", function () {
    convertCurrency(
      API,
      converterFrom[0].value,
      converterTo[0].value,
      this.value,
      false
    );
  });

  converterToCount.on("input", function () {
    convertCurrency(
      API,
      converterTo[0].value,
      converterFrom[0].value,
      this.value,
      true
    );
  });

  converterFrom.change(function () {
    convertCurrency(
      API,
      this.value,
      converterTo[0].value,
      converterFromCount[0].value,
      false
    );
  });

  converterTo.change(function () {
    convertCurrency(
      API,
      this.value,
      converterFrom[0].value,
      converterToCount[0].value,
      true
    );
  });

  currencyListSelect.change(function () {
    currencyRateList.empty();
    getAllCurrenciesRates(API, this.value);
  });
});

function getAllCurrencies(API) {
  // Отримуєм список валют по API або з Local Storage
  // при виборі ajax або fetch віддав перевагу останьому...

  let currencyList = localStorage.getItem("currencyList");

  if (currencyList == null) {
    const myHeaders = new Headers();
    myHeaders.append("apikey", API);

    const requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: myHeaders,
    };

    fetch("https://api.apilayer.com/exchangerates_data/symbols", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        jsonResult = JSON.parse(result);
        if (jsonResult.success === false) {
          alert("Не вдалося отримати список валют!");
          return null;
        }
        localStorage.setItem(
          "currencyList",
          JSON.stringify(jsonResult.symbols)
        );
        currencyListHandler(jsonResult.symbols);
      })
      .catch((error) => {
        console.log("error", error);
        return null;
      });
  } else {
    currencyList = JSON.parse(currencyList);
    currencyListHandler(currencyList);
  }
}

function currencyListHandler(currencyList) {
  // заповнюєм список на формі валютами

  const converterFrom = $(".converter-from__currency"),
    converterTo = $(".converter-to__currency"),
    currencyListSelect = $("#currency-rate__select");

  if (!converterFrom.length || !converterTo.length) {
    alert("Помилка при завантаженні списку валют до елементу");
    return;
  }

  let optElem;
  for (key in currencyList) {
    optElem = $(document.createElement("option")).prop({
      value: key,
      text: currencyList[key],
    });
    converterFrom.append(optElem);
    converterTo.append(optElem.clone());
    currencyListSelect.append(optElem.clone());
  }
}

function convertCurrency(
  API,
  currencyFrom,
  currencyTo,
  amount,
  rotateOperation
) {
  // Виконуєм конвертацію валюти по API та викликаєм обобник для виведення інформації на форму
  if (Number(amount) == 0) {
    return;
  }

  const myHeaders = new Headers();
  myHeaders.append("apikey", API);

  const requestOptions = {
    method: "GET",
    redirect: "follow",
    headers: myHeaders,
  };

  fetch(
    `https://api.apilayer.com/exchangerates_data/convert?to=${currencyTo}&from=${currencyFrom}&amount=${amount}`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      jsonResult = JSON.parse(result);
      if (jsonResult.success === false) {
        alert("Не вдалося виконати конвертацію!");
        return null;
      }

      convertCurrencyHandler(
        jsonResult.result,
        jsonResult.info.rate,
        rotateOperation
      );
    })
    .catch((error) => console.log("error", error));
}

function convertCurrencyHandler(result, rate, rotateOperation) {
  //виводим результат запиту на форму

  const converterToCount = $("#converter-to__count"),
    converterFromCount = $("#converter-from__count"),
    converterRate = $(".converter-rate__rate");

  if (!converterToCount.length || !converterFromCount.length) {
    alert("Помилка при виведенні результату конвертації на форму");
    return;
  }

  converterRate.text(rate.toFixed(2));

  if (!rotateOperation) {
    converterToCount.val(result.toFixed(2));
  } else {
    converterFromCount.val(result.toFixed(2));
  }
}

function getAllCurrenciesRates(API, base) {
  // Отримуєм список курсів валют по API

  const myHeaders = new Headers();
  myHeaders.append("apikey", API);

  const requestOptions = {
    method: "GET",
    redirect: "follow",
    headers: myHeaders,
  };

  fetch(
    `https://api.apilayer.com/exchangerates_data/latest?base=${base}`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      jsonResult = JSON.parse(result);
      if (jsonResult.success === false) {
        alert("Не вдалося отримати список курсів валют!");
        return null;
      }

      currencyListRateHandler(jsonResult.rates);
    })
    .catch((error) => console.log("error", error));
}

function currencyListRateHandler(currencyListRate) {
  // заповнюєм список курсів валют на формі

  const currencyRateList = $(".currency-rate__list");

  if (!currencyRateList.length) {
    alert("Помилка при завантаженні списку курсів валют до таблиці");
    return;
  }

  let currencyList = localStorage.getItem("currencyList");

  if (currencyList == null) {
    alert("Помилка при завантаженні списку курсів валют до таблиці");
    return;
  }

  currencyList = JSON.parse(currencyList);

  let optElem;
  for (key in currencyListRate) {
    optElem = $(document.createElement("tr"));

    optElem.append($(document.createElement("td")).text(currencyList[key]));
    optElem.append(
      $(document.createElement("td")).text(currencyListRate[key].toFixed(2))
    );

    currencyRateList.append(optElem);
  }
}
