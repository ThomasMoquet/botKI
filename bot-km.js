var casper = require('casper').create({
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'LonelyBot'
  }
});





if (!casper.cli.options.login||!casper.cli.options.pwd){
	casper.echo("You must give login and password :");
	casper.echo("--login : login");
	casper.echo("--pwd : password");
	casper.exit();
}


casper.start('http://www.kraland.org/main.php', function() {
    this.fill('form[action="main.php?p=1&a=100"]', { p1: casper.cli.options.login, p2: casper.cli.options.pwd }, true);
});
casper.then(function() {
    this.evaluateOrDie(function() {
        return /PROFIL/.test(document.querySelector(".right-boxprofile-header").innerText);
    }, 'Connection ratée');
    this.echo('Connection réussie');
});
casper.then(function(){		
	mails = this.evaluate(function() {
		    return document.querySelector(".right-boxprofile-button[title=kramail] img").getAttribute("src").split('/').pop();
	});
	if (mails != "mail.gif"){
    	this.echo('Nouveaux mails');
		casper.open("http://www.kraland.org/main.php?p=8_1");
		casper.then(function(){
			boitesPleines = this.evaluate(function() {
				boitesPleines = new Array();
				boites = document.querySelectorAll("#left .submenu ul:first-child li a");
				for (i=0;i < boites.length;i++) {
					boite = boites[i];
					if (boite.innerText.indexOf('(')>=0 && boite.innerText.indexOf(')')>=0){
						 boitesPleines[boitesPleines.length] = boite.getAttribute('href');
					}
				}
				return boitesPleines;
			});
			casper.eachThen(boitesPleines, function(response){
				boite = response.data;
				casper.open("http://www.kraland.org/" + boite);
				casper.then(function(){
					newKM = this.evaluate(function() {
						newKM = new Array();
						kms = document.querySelectorAll("#central-text .forum a.text-bold");
						for (j=0;j < kms.length;j++) {
							newKM[newKM.length] = kms[j].getAttribute('href');
						}
						return newKM;

					});
					casper.eachThen(newKM, function(response){
						km = response.data;
						this.echo('Transfert http://www.kraland.org/' + km);
						casper.open("http://www.kraland.org/" + km);
						casper.thenOpen("http://www.kraland.org/" + km + "&p0=1", function(){
							this.fill("form[name=post_msg]", {
								p7 : "KraDesk [anim]"
							}, true);
						});

					});
				});
			});
		});
	}
	

});
casper.run();
