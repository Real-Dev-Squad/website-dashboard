const BASE_URL = "https://api.realdevsquad.com";

function getObjectOfFormData(formId) {
  const object = {};
  const data = new FormData(formId);

  data.forEach((value, key) => {
    if (!Reflect.has(object, key)) {
      object[key] = value;
      return;
    }
    if (!Array.isArray(object[key])) {
      object[key] = [object[key]];
    }
    object[key].push(value);
  });
  console.log(object);
  return object;
}

/**
 * Hide/shows the loader of the form submit button
 * @param {Boolean} show whether to show loader or hide
 */
const showSubmitLoader = (show = true) => {
  const loadingWrapper = document.getElementById('submit-loader')
  if (show) {
    loadingWrapper.classList.remove("hidden");
    loadingWrapper.classList.add('loader-wrapper');
  }
  else {
    loadingWrapper.classList.add("hidden");
    loadingWrapper.classList.remove('loader-wrapper');
  }
}

featureForm.onsubmit = async (e) => {
  e.preventDefault();
  showSubmitLoader()

  const {
    feature_name,
    feature_title,
    feature_owner,
    is_enabled,
  } = getObjectOfFormData(featureForm);

  const dataToBeSent = {
    feature_name,
    feature_title,
    feature_owner,
    config: {
      enabled: is_enabled
    }
  };

  console.log(dataToBeSent);

  try {
    const response = await fetch(`${BASE_URL}/featureFlags`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(dataToBeSent),
      headers: {
        "Content-type": "application/json",
      },
    });

    const result = await response.json();

    alert(result.message);
  } catch (error) {
    alert(`Error: ${error}`);
  } finally {
    showSubmitLoader(false);
  }

};

let addEventToInput = (input, event, fn) => {
  Array.from(input).forEach(function (element) {
    element.addEventListener(event, fn);
  });
};

let stateHandle = () => {
  const arrInput = Object.values(input);

  let results = arrInput.filter(function (item, index, array) {
    if (item.value === "") {
      return true;
    }
  });

  if (results.length === 0) {
    button.disabled = false;
    document.getElementById("submit").classList.add("active");
    document.getElementById("submit").classList.remove("disabled");
  } else {
    button.disabled = true;
    document.getElementById("submit").classList.add("disabled");
    document.getElementById("submit").classList.remove("active");
  }
};

const input = document.getElementsByClassName("input");

const button = document.getElementById("submit");
button.disabled = true; //setting button state to disabled
addEventToInput(input, "change", stateHandle);


