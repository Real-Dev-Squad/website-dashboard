
const featureContent = [
    {
        name: "f1",
        title: "Feature one",
        created_at: 1620498600000,
        updated_at: 1620498600000,
        owner: {
            username:"ashwini",
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
            username:"ankita",
            img: "https://raw.githubusercontent.com/Real-Dev-Squad/website-static/main/members/ankita/img.png"
        },
        config: {
            enabled: false
        },
        launched_at: 1614018600000
    }
]

function setStructure(){
    const featureBox = document.createElement("div");
    featureBox.classList.add("featureBox");
    const primaryInfo = document.createElement("div");
    primaryInfo.classList.add("primaryInfo");
    const secondaryInfo = document.createElement("div");
    secondaryInfo.classList.add("secondaryInfo");
    const primaryInfo1 = document.createElement("div");
    primaryInfo1.classList.add("primaryInfo1");
    const primaryInfo2 = document.createElement("label");
    primaryInfo2.classList.add("primaryInfo2");
    const featureName = document.createElement("p");
    featureName.classList.add("featureName");
    const createdDate = document.createElement("p");
    createdDate.classList.add("createdDate");
    const featureToggle = document.createElement("input");
    featureToggle.setAttribute("type", "checkbox");
    featureToggle.setAttribute("checked", "true");
    featureToggle.classList.add("filled-in");
    featureToggle.classList.add("featureToggle");
    const activeToggle = document.createElement("span");
    activeToggle.classList.add("checked");
    const isActive = document.createElement("label");
    isActive.classList.add("isActive");
    const launchedDate = document.createElement("p");
    launchedDate.classList.add("launchedDate");
    const secondaryInfo1 = document.createElement("div");
    secondaryInfo1.classList.add("secondaryInfo1");
    const ownerName = document.createElement("p");
    ownerName.classList.add("ownerName");
    const ownerImg = document.createElement("img");
    ownerImg.classList.add("ownerImg");
    const border = document.createElement("hr");
    border.classList.add("border");

    const container = document.getElementById("container");
    container.appendChild(featureBox);
    featureBox.appendChild(primaryInfo);
    featureBox.appendChild(secondaryInfo);
    featureBox.appendChild(border);
    primaryInfo.appendChild(primaryInfo1);
    primaryInfo.appendChild(primaryInfo2);
    primaryInfo1.appendChild(featureName);
    primaryInfo1.appendChild(createdDate);
    primaryInfo2.appendChild(featureToggle);
    primaryInfo2.appendChild(activeToggle);
    primaryInfo2.appendChild(isActive);    
    secondaryInfo.appendChild(launchedDate);
    secondaryInfo.appendChild(secondaryInfo1);
    secondaryInfo1.appendChild(ownerName);
    secondaryInfo1.appendChild(ownerImg);
}

var i = 0;

function setValues(title, createdAgo, launchedAgo, isEnabled, owner, ownerImage){
    const featureName = document.getElementsByClassName("featureName")[i];
    const createdDate = document.getElementsByClassName("createdDate")[i];
    const featureToggle = document.getElementsByClassName("featureToggle")[i];
    const activeToggle = document.getElementsByClassName("checked")[i];
    const isActive = document.getElementsByClassName("isActive")[i];
    const launchedDate = document.getElementsByClassName("launchedDate")[i];
    const ownerName = document.getElementsByClassName("ownerName")[i];
    const ownerImg = document.getElementsByClassName("ownerImg")[i];
    featureName.innerHTML = title;

    createdDate.innerHTML = "<i class='fas fa-calendar-alt'></i>"
    +"<span style='font-size:18px;'> Created </span>"
    +"<span style='font-weight: bold;'>" + createdAgo + " days ago"+"</span>";

    isActive.innerHTML = "Active";
    launchedDate.innerHTML = "Lauched " + launchedAgo + " days ago";
    ownerName.innerHTML = "<span style='color:#ADACBE;'>POC: </span>"+"<span style='font-weight: bold;'>"+owner+"</span>";
    ownerImg.src =  ownerImage;
    if(isEnabled === false){
        featureToggle.checked = false;
        activeToggle.classList.remove("checked");
        activeToggle.classList.add("unchecked");
        featureName.classList.add("inactive");
        createdDate.classList.add("inactive");
        isActive.innerHTML = "off";
        isActive.classList.add("inactive");
        launchedDate.classList.add("inactive");
        ownerName.classList.add("inactive");
        ownerImg.classList.add("imgInactive");
    }
    
    i++;
}

featureContent.forEach((feature)=>{ 
    setStructure();

    const today = Date.now();
    const createdAt = feature.created_at;
    const launchedAt = feature.launched_at;
    const createdAgo = Math.floor((today - createdAt)/(1000*3600*24));
    const launchedAgo = Math.floor((today - launchedAt)/(1000*3600*24));

    setValues(feature.title,
        createdAgo,
        launchedAgo,
        feature.config.enabled,
        feature.owner.username,
        feature.owner.img);   
});






