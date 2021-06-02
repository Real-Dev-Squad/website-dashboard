const featureContent = [
  {
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

function getDateFromTimestamp(ts) {
  const today = Date.now();
  return Math.floor((today - ts) / (1000 * 3600 * 24));
}

function createFeatureElement(featureData) {
  const template = document.querySelector("#feature-template")
  const feature = template.content.cloneNode(true);

  feature.querySelector(".featureName").innerHTML = featureData.title;
  feature.querySelector(".createdDate > span:nth-child(3)").innerHTML = getDateFromTimestamp(featureData.created_at) + " days ago";
  feature.querySelector(".isActive").innerHTML = "Active";
  feature.querySelector(".launchedDate").innerHTML = "Launched " + getDateFromTimestamp(featureData.launched_at) + " days ago";
  feature.querySelector(".ownerName > span:nth-child(2)").innerHTML = featureData.owner.username;
  feature.querySelector(".ownerImg").setAttribute("src", featureData.owner.img);

  if (!featureData.config.enabled) {
    feature.querySelector(".featureName").classList.add("inactive");
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

window.onload = function () {
  const container = document.querySelector("#container");
  featureContent.forEach((feature) => {
    container.appendChild(createFeatureElement(feature))
  });
}
