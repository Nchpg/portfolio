
let CurrentPage = 0;
let ListPage = ["HomePage", "AboutPage", "WorksPage", "ContactPage"]
let InProgress = "False";

async function HomeTransition(){
    if(InProgress == "False"){
        InProgress = "True";
        console.log(InProgress);
        await Transition("HomePage", ListPage[CurrentPage]);
        document.getElementById("HomePage").classList.remove('disable');
        document.getElementById("AboutPage").classList.add('disable');
        document.getElementById("WorksPage").classList.add('disable');
        document.getElementById("ContactPage").classList.add('disable');
        await reveal("HomePage", ListPage[CurrentPage]);
        CurrentPage = 0;
        InProgress = "False";
        console.log(InProgress);
    }
}

async function AboutTransition(){
    if(InProgress == "False"){
        InProgress = "True";
        await Transition("AboutPage", ListPage[CurrentPage]);
        document.getElementById("HomePage").classList.add('disable');
        document.getElementById("AboutPage").classList.remove('disable');
        document.getElementById("WorksPage").classList.add('disable');
        document.getElementById("ContactPage").classList.add('disable');
        await reveal("AboutPage", ListPage[CurrentPage]);
        InProgress = "False";
        CurrentPage = 1;
    }
}

async function WorksTransition(){
    if(InProgress == "False"){
        InProgress = "True";
        await Transition("WorksPage", ListPage[CurrentPage]);
        document.getElementById("HomePage").classList.add('disable');
        document.getElementById("AboutPage").classList.add('disable');
        document.getElementById("WorksPage").classList.remove('disable');
        document.getElementById("ContactPage").classList.add('disable');
        await reveal("WorksPage", ListPage[CurrentPage]);
        InProgress = "False";
        CurrentPage = 2;
    }
}

async function ContactTransition(){
    if(InProgress == "False"){
        InProgress = "True";
        await Transition("ContactPage", ListPage[CurrentPage]);
        document.getElementById("HomePage").classList.add('disable');
        document.getElementById("AboutPage").classList.add('disable');
        document.getElementById("WorksPage").classList.add('disable');
        document.getElementById("ContactPage").classList.remove('disable');
        await reveal("ContactPage", ListPage[CurrentPage]);
        InProgress = "False";
        CurrentPage = 3;
    }
}

function Transition(Page, OldPage){
    return new Promise((resolve,reject)=>{
        document.getElementById("slider").classList.toggle('active');
        document.getElementById("Transition").classList.toggle('active');
        unreveal(Page, OldPage);
        setTimeout(function(){
            document.getElementById("slider").classList.toggle('active');
            document.getElementById("Transition").classList.toggle('active');
            resolve();
        },800);
    });
}




document.querySelectorAll(".arrow.up").forEach(box => {
    switch (ListPage[CurrentPage+1]) {
        case "HomePage":
            box.addEventListener("click", HomeTransition);
            break;

        case "AboutPage":
            box.addEventListener("click", AboutTransition);
            break;
        
        case "WorksPage":
            box.addEventListener("click", WorksTransition);
        break;

        case "ContactPage":
            box.addEventListener("click", ContactTransition);
            break;

        default:
            break;
    }
    
});

document.getElementById("Home").addEventListener("click", HomeTransition);
document.getElementById("About").addEventListener("click", AboutTransition);
document.getElementById("Works").addEventListener("click", WorksTransition);
document.getElementById("Contact").addEventListener("click", ContactTransition);


function reveal(Page, OldPage) {
    return new Promise((resolve,reject)=>{
        var reveals = document.getElementById(Page).querySelectorAll(".reveal");
        for (var i = 0; i < reveals.length; i++) {
          reveals[i].classList.add("active");
        }
    
        setTimeout(function(){
            document.getElementById("arrow1").classList.add('animate');
            resolve();
        }, 1000);
    });

    

}

function revealInit() {
    reveal("HomePage", " ");
}

function unreveal(Page, OldPage) {
    var reveals = document.getElementById(OldPage).querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
      reveals[i].classList.remove("active");
      reveals[i].classList.add("disable");
    }

    document.getElementById("arrow1").classList.remove('animate')

    setTimeout(function(){
        for (var i = 0; i < reveals.length; i++) {
            reveals[i].classList.remove("disable");
          }
    }, 1000);

}

window.addEventListener("load", revealInit);
window.addEventListener("load", mediaQuery);

window.addEventListener("resize", mediaQuery);

function mediaQuery(){
    if (!window.matchMedia("(min-width: 650px)").matches) {
        document.getElementById("avatar").classList.remove("fade-right");
        document.getElementById("name").classList.add("fade-right");
    }else{
        document.getElementById("avatar").classList.add("fade-right");
        document.getElementById("name").classList.remove("fade-right");
    }
}