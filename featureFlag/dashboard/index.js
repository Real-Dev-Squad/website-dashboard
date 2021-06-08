const featureContent = [
  {
    id: "ap1234",
    name: "f1",
    title: "Feature one",
    created_at: 1620498600000,
    updated_at: 1620498600000,
    owner: {
      username: "ashwini",
      img: "https://raw.githubusercontent.com/Real-Dev-Squad/website-static/main/members/ashwini/img.png"
    },
    config: {
      enabled: true
    },
    launched_at: 1620930600000
  },
  {
    id: "ab5678",
    name: "f2",
    title: "Feature two",
    created_at: 1613759400000,
    updated_at: 1613759400000,
    owner: {
      username: "ankita",
      img: "https://raw.githubusercontent.com/Real-Dev-Squad/website-static/main/members/ankita/img.png"
    },
    config: {
      enabled: false
    },
    launched_at: 1614018600000
  }
]

const BASE_URL = "https://api.realdevsquad.com";

function getDateFromTimestamp(ts) {
  const today = Date.now();
  return Math.floor((today - ts) / (1000 * 3600 * 24));
}

function createFeatureElement(featureData) {
  const template = document.querySelector("#feature-template");
  const feature = template.content.cloneNode(true);

  feature.querySelector(".featureBox").setAttribute("id", featureData.id);
  feature.querySelector(".featureTitle").innerHTML = featureData.title;
  feature.querySelector(".createdDate > span:nth-child(3)").innerHTML = getDateFromTimestamp(featureData.created_at) + " days ago";
  feature.querySelector(".primaryInfo2 > span").setAttribute("id", featureData.id);
  feature.querySelector(".isActive").innerHTML = "Active";
  feature.querySelector(".launchedDate").innerHTML = "Launched " + getDateFromTimestamp(featureData.launched_at) + " days ago";
  feature.querySelector(".ownerName > span:nth-child(2)").innerHTML = featureData.owner.username;
  feature.querySelector(".ownerImg").setAttribute("src", featureData.owner.img);

  if (!featureData.config.enabled) {
    feature.querySelector(".featureTitle").classList.add("inactive");
    feature.querySelector(".createdDate").classList.add("inactive");
    const featureCkbox = feature.querySelector(".featureToggle");
    featureCkbox.setAttribute("checked", "false");
    const ckboxOverlay = feature.querySelector(".primaryInfo2 > span");
    ckboxOverlay.classList.remove("checked");
    ckboxOverlay.classList.add("unchecked");
    feature.querySelector(".isActive").innerHTML = "off";
    feature.querySelector(".isActive").classList.add("inactive");
    feature.querySelector(".launchedDate").classList.add("inactive");
    feature.querySelector(".ownerName").classList.add("inactive");
    feature.querySelector(".ownerImg").classList.add("imgInactive");
  }

  return feature;
}

const changeTheFeatureToggle = (id) => {
  const featureBox = document.getElementById(id);

  if (featureBox.querySelector(".ckBoxToggle").classList.contains("checked")) {

    featureBox.querySelector(".featureTitle").classList.add("inactive");
    featureBox.querySelector(".createdDate").classList.add("inactive");
    const featureCkbox = featureBox.querySelector(".featureToggle");
    featureCkbox.setAttribute("checked", "false");
    const ckboxOverlay = featureBox.querySelector(".primaryInfo2 > span");
    ckboxOverlay.classList.remove("checked");
    ckboxOverlay.classList.add("unchecked");
    featureBox.querySelector(".isActive").innerHTML = "off";
    featureBox.querySelector(".isActive").classList.add("inactive");
    featureBox.querySelector(".launchedDate").classList.add("inactive");
    featureBox.querySelector(".ownerName").classList.add("inactive");
    featureBox.querySelector(".ownerImg").classList.add("imgInactive");

  } else {

    featureBox.querySelector(".featureTitle").classList.remove("inactive");
    featureBox.querySelector(".createdDate").classList.remove("inactive");
    const featureCkbox = featureBox.querySelector(".featureToggle");
    featureCkbox.setAttribute("checked", "true");
    const ckboxOverlay = featureBox.querySelector(".primaryInfo2 > span");
    ckboxOverlay.classList.add("checked");
    ckboxOverlay.classList.remove("unchecked");
    featureBox.querySelector(".isActive").innerHTML = "Active";
    featureBox.querySelector(".isActive").classList.remove("inactive");
    featureBox.querySelector(".launchedDate").classList.remove("inactive");
    featureBox.querySelector(".ownerName").classList.remove("inactive");
    featureBox.querySelector(".ownerImg").classList.remove("imgInactive");

  }
}

window.onload = function () {
  const container = document.querySelector("#container");
  featureContent.forEach((feature) => {
    container.appendChild(createFeatureElement(feature))
  });

  let addEventToFeatureToggle = (featureToggle, event, fn) => {
    Array.from(featureToggle).forEach((element) => {
      element.addEventListener(event, fn);
    });
  };

  const handleClick = async (e) => {
    const featureId = e.srcElement.getAttribute("id");
    let dataToBeSent;
    if (e.srcElement.classList.contains("checked")) {
      dataToBeSent = {
        config: { enabled: false }
      }
    } else {
      dataToBeSent = {
        config: { enabled: true }
      }
    }

    try {
      const response = await fetch(`${BASE_URL}/featureFlags/${featureId}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(dataToBeSent),
        headers: {
          "Content-type": "application/json",
        },
      });
      const result = await response.json();
      alert(result.message);
      if(result.status === 200){
        changeTheFeatureToggle(featureId);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  }

  const featureToggle = document.getElementsByClassName("ckBoxToggle");
  addEventToFeatureToggle(featureToggle, "click", handleClick);
}
