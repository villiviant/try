var specieI = 1;
var currentId = 1;
var currentSbj = 1;

 
var setEvents = function() {
	//$('article a').click(go);	
	$('article [data-key]').keydown(function(e){
		if(e.which == 13){
			e.preventDefault();
			searchpoke(e,$(this));
		}
	});
	$('#nav td').unbind('click').click(navSec);
};
var ajaxerror = function(err, textStatus, errorThrown){
	alert('Error: '+textStatus);
};
var navSec = function(e) {
	var url = '#'+currentSbj+'/'+$(this).data('key')+'/'+currentId;
	//if(hash!=app.name)
		//history.pushState({val: currentId}, currentId, url);
		search(e,url);
};
var searchpoke = function(e,t){
	if(t===undefined) var input = $(this).parents('section:first').find('[data-key]');
	else var input = $(t);
	var key = input.data('key').replace(/[^\w]/g, "");
	var val = input.text().replace(/[^\w-]/g, "");
	if(window.location.hash != 'pokemon/index/'+val)
		window.location.hash = 'pokemon/index/'+val;
	search(e,'pokemon/index/'+val);
}
var search = function(e,url){
	$('h1 button').addClass('loading');
	url=url.split('/');
	var sbj = url[0].replace(/[^\w]/g, "");
	var key = url[1].replace(/[^\w]/g, "");
	var val = url[2].replace(/[^\w-]/g, "");
	if(sbj=='pokemon'||sbj=='type') $.ajax({
			dataType: 'jsonp',jsonp: 'jsonp_callback',
			url: 'http://wahackpokemon.com/wah/api/dex-get.'+sbj+'.php?'+key+'='+val+'&hl='+hl,
			//url: 'http://dex.git.hub/api/get.'+sbj+'.php?'+key+'='+val+'&hl='+hl,
			success: function(data) {
				if(!data || data.length <1) doLayout(l10n[hl].noresults,'c8','<center><br />'+l10n[hl].cantfind+'</center>');
				else if(key=='index') {
					if(data.length==1) {
						currentId = parseInt(data[0]['id']);
						currentSbj = sbj;
						if(sbj=='pokemon') var color = 'c'+data[0]['color_id'];
						else if(sbj=='type') var color = 't'+val;
						else var color = 'c'+sbj;
						doLayout(data[0]['name'],color,data[0],key,sbj);
					} else if(data.length>1) {
						var results = '<ul>';
						for(var i=0;i<data.length;i++) 
							results += '<li><a href="#'+sbj+'/index/'+data[i]['id']+'">'+data[i]['name']+'</a></li>';
						results += '</ul>';
						doLayout('Resultados','c5',results);
					}
				} else {
					doLayout($('h1 span').text(),$('body').attr('class'),data,key,sbj);
				}
			},
			error: ajaxerror
	});
};
// Build the layout
// title
// color: 1=black 2=blue 3=brown 4=gray 5=green 6=pink 7=purple 8=red 9=white 10=yellow 
var doLayout = function(title,color,content,key,sbj) {
	$('h1 button').removeClass('loading');
	$('h1 span').fadeOut('fast', function(){
		$('article').removeClass('pokemon move type item berry stat loc undefined').addClass(sbj+' ');
		$(this).html(title).fadeIn();
	});
	$('body').removeClass().addClass(color);
	
	if(key && sbj && layouts[sbj][key]) layouts[sbj][key](content);
	else $('article').fadeOut('fast', function(){
		$(this).html(content).fadeIn(function(){
			setEvents();
		});
	});
};
var layouts = { pokemon: { index: function(o) {
	var bio = '<div id="biomain"><img src="http://wahackpokemon.com/dex/sprites/xy/'+o.species_id+'.png" alt="" /><p><strong>'+o.genus+'</strong><br />'+(o.flavor_text?o.flavor_text:'')+'</p></div>';
		bio += '<div class="horiz"><span><strong>National:</strong> <code data-key="specieid" contenteditable="true">'+o.species_id+'</code></span></div>';
		bio += '<div class="fifty">'
		+'<div><strong>'+l10n[hl].height+':</strong> '+ (o.height<10?o.height+'0 cm': o.height/10 +' m') +'<br /><strong>'+l10n[hl].weight+':</strong> '+ o.weight/10 +' kg</div>'
		+'<div><strong>'+l10n[hl].type+':</strong> <a class="typq ty'+o.type1_id+'" href="#type/index/'+o.type1_id+'">'+o.type1_name+'</a>'
		+(o.type2_id ?' / <a class="typq ty'+o.type2_id+'" href="#type/index/'+o.type2_id+'">'+o.type2_name+'</a>':'')
		+'<br /><strong>'+l10n[hl].rarity+':</strong> '+o.capture_rate+'</div>'+'</div>';
	var ev = JSON.parse(o.evolution_chain);
	var evolhtml = '<div>';
	var evolhtml2 = '';
	var evolhtml3 = '';
	for(i in ev) {
		evolhtml += '<a href="#pokemon/index/'+i+'"><img src="http://wahackpokemon.com/dex/sprites/xy/'+i+'.png" alt="" /></a>'; 
		for(j in ev[i]) {
			if(j!='way') evolhtml2 += '<strong>'+ev[i][j]['way']+'<a href="#pokemon/index/'+j+'"><img src="http://wahackpokemon.com/dex/sprites/xy/'+j+'.png" alt="" /></a></strong>'; 
			for(k in ev[i][j]) {
				if(k!='way') evolhtml3 += '<strong>'+ev[i][j][k]['way']+'<a href="#pokemon/index/'+k+'"><img src="http://wahackpokemon.com/dex/sprites/xy/'+k+'.png" alt="" /></a></strong>'; 
			}
		}
	} 
	evolhtml += '</div>';
	if(evolhtml2) evolhtml += '<div>'+evolhtml2+'</div>';
	if(evolhtml3) evolhtml += '<div>'+evolhtml3+'</div>';
	bio += '<h2 class="f">'+l10n[hl].evol+'</h2>'+'<div id="bio1">'+evolhtml+'</div>';
		if(currentId>1) bio+='<a class="f pagin" href="#pokemon/index/'+(currentId-1)+'" style="float:left">&laquo;</a>';
		if(currentId<718) bio+='<a class="f pagin" href="#pokemon/index/'+(currentId+1)+'" style="float:right">&raquo;</a>';
	$('article').removeClass('fadeIn').addClass('fadeOut');
	setTimeout(function(){
		$('article').html(chrome.pokemon[0]+'<section>'+bio+'</section>').removeClass('fadeOut').addClass('fadeIn');
		setEvents();
		$('#nav td:eq(0)').addClass('f');
	}, 200 );
}, moves: function(o) {
	var mov1='';
	if(o[1]) for(var i=0;i<o[1].length;i++)
		mov1+='<a href="#move/index/'+o[1][i].move_id+'" class="ty ty'+o[1][i].type_id+'">lv.'
		+o[1][i].level+' <span>'+o[1][i].name+'</span>'
		+'<i class="mcl movcl'+o[1][i]['class']+'">✶</i><i class="acc">'+(o[1][i].accuracy>0?o[1][i].accuracy+'%':'-')+'</i>'
		+'<i class="ppo">'+o[1][i].pp+' pp</i><i class="pow">'+(o[1][i].power>0?o[1][i].power:'-')+'</i></a>';
	var mov2='';
	if(o[2]) for(var i=0;i<o[2].length;i++)
		mov2+='<a href="#move/index/'+o[2][i].move_id+'" class="ty ty'+o[2][i].type_id+'">'
		+'<span>'+o[2][i].name+'</span>'
		+'<i class="mcl movcl'+o[2][i]['class']+'">✶</i><i class="acc">'+(o[2][i].accuracy?o[2][i].accuracy+'%':'-')+'</i>'
		+'<i class="ppo">'+o[2][i].pp+' pp</i><i class="pow">'+(o[2][i].power>0?o[2][i].power:'-')+'</i></a>';
var mov3='';
	if(o[3]) for(var i=0;i<o[3].length;i++)
		mov3+='<a href="#move/index/'+o[3][i].move_id+'" class="ty ty'+o[3][i].type_id+'">'
		+'<span>'+o[3][i].name+'</span>'
		+'<i class="mcl movcl'+o[3][i]['class']+'">✶</i><i class="acc">'+(o[3][i].accuracy?o[3][i].accuracy+'%':'-')+'</i>'
		+'<i class="ppo">'+o[3][i].pp+' pp</i><i class="pow">'+(o[3][i].power>0?o[3][i].power:'-')+'</i></a>';
var mov4='';
	if(o[4]) for(var i=0;i<o[4].length;i++)
		mov4+='<a href="#move/index/'+o[4][i].move_id+'" class="ty ty'+o[4][i].type_id+'">'
		+'<span>'+o[4][i].name+'</span>'
		+'<i class="mcl movcl'+o[4][i]['class']+'">✶</i><i class="acc">'+(o[4][i].accuracy?o[4][i].accuracy+'%':'-')+'</i>'
		+'<i class="ppo">'+o[4][i].pp+' pp</i><i class="pow">'+(o[4][i].power>0?o[4][i].power:'-')+'</i></a>';
	var html = chrome.pokemon[0]+'<section id="moves">';
	if(mov1) html += '<h2 class="f">'+l10n[hl].bylevel+'</h2><div>'+mov1+'</div>';
	if(mov2) html += '<h2 class="f">'+l10n[hl].byegg+'</h2><div>'+mov2+'</div>';
	if(mov3) html += '<h2 class="f">'+l10n[hl].bytutor+'</h2><div>'+mov3+'</div>';
	if(mov4) html += '<h2 class="f">'+l10n[hl].bytmhm+'</h2><div>'+mov4+'</div>';
	$('article').removeClass('fadeIn').addClass('fadeOut');
	setTimeout(function(){
		$('article').html(html+'</section>').removeClass('fadeOut').addClass('fadeIn');
		setEvents();
		$('#nav td:eq(1)').addClass('f');
	}, 200 );
}, area: function(o) {
	if(o[0]=='NO' || o[0]=='vers') {
		var vers = {1:'<i data-v="1" class="ty10">I</i>',2:'<i data-v="2" class="ty11">I</i>',3:'<i data-v="3" class="ty13">I</i>',4:'<i data-v="4" class="ty5">II</i>',5:'<i data-v="5" class="ty9">II</i>',6:'<i data-v="6" class="ty15">II</i>',7:'<i data-v="7" class="ty2">III</i>',8:'<i data-v="8" class="ty16">III</i>',9:'<i data-v="9" class="ty12">III</i>',10:'<i data-v="10" class="ty10">III</i>',11:'<i data-v="11" class="ty7">III</i>',12:'<i data-v="12" class="ty11">IV</i>',13:'<i data-v="13" class="ty14">IV</i>',14:'<i data-v="14" class="ty4">IV</i>',15:'<i data-v="15" class="ty6">IV</i>',16:'<i data-v="16" class="ty1">IV</i>',17:'<i data-v="17" class="ty9">V</i>',18:'<i data-v=18" class="ty17">V</i>',19:'',20:'',21:'<i data-v="21" class="ty9" style="color:cyan">V</i>',22:'<i data-v="22" class="ty17" style="color:cyan">V</i>',23:'<i data-v="23" class="ty16">VI</i>',24:'<i data-v="24" class="ty18">VI</i>',NO:l10n[hl].noresults ,vers:''};
		var areas= chrome.pokemon[0]+'<section id="area">'+'<div id="vers">';
		for(var i=0;i<o.length;i++) areas+=vers[o[i]];
		areas +='</div><ul>'+(o[0]!='NO'?'<li><span>'+l10n[hl].choosevers+'</span></li>':'')+'</ul></section>';
		$('article').removeClass('fadeIn').addClass('fadeOut');
		setTimeout(function(){
			$('article').html(areas).removeClass('fadeOut').addClass('fadeIn');
			setEvents();
			$('#vers i').click(function(e){
				search(e,'pokemon/area/'+currentId+'-'+$(this).data('v'));
			});
			$('#nav td:eq(2)').addClass('f');
		}, 200 );
	} else {
		var ul ='';
		for(var i=0;i<o.length;i++) ul+= '<li><span><i class="meth'+o[i].method+'">lv.'+o[i].min_level+(o[i].max_level>o[i].min_level?'-'+o[i].max_level:'')+' '+o[i].rarity+'%</i><strong>'+o[i].loc+(o[i].area?(o[i].loc.length+o[i].area.length>32?'<br />':' ')+'<small>'+o[i].area+'</small>':'')+'</strong></span></li>';
		$('article ul').removeClass('fadeIn').addClass('fadeOut');
		setTimeout(function(){
			$('article ul').html(ul).removeClass('fadeOut').addClass('fadeIn');
		}, 200 );
	}
}, stats: function(o) {
	var	stats = chrome.pokemon[0]+'<section id="stats">';
	var h2 = false; var total =0; var totalKeyPre = ''; var typeKeyPre = ''; 
	for(var i=0;i<o.length;i++) {
		statsNames = ['hp','attack','defense','spattack','spdefense','speed']
		var totalKey =''; statshtml = '';
		for(var j=0;j<statsNames.length;j++) {
			if(j==0 && o[i][statsNames[j]]) total = (o[i][statsNames[j]]*1); else total += (o[i][statsNames[j]]*1);
			if(j==0 && o[i][statsNames[j]]) totalKey = o[i][statsNames[j]]; else totalKey += o[i][statsNames[j]];
			if(o[i][statsNames[j]]) statshtml += '<span class="st-'+statsNames[j]+'"><i class="f" style="width:'+(o[i][statsNames[j]] / 2.55)+'%"></i>'
				+statsNames[j]+' <strong>'+o[i][statsNames[j]]+'</strong></span>';
		}
		if(h2) stats+= '<h2 class="f">'+o[i]['form']+'</h2>';
		stats += '<div id="form'+o[i]['id']+'" class="form">'; //120-720 1-255
		stats += '<span class="formsprite"><img src="';
				if(!h2) stats +='http://wahackpokemon.com/dex/sprites/xy/'+o[i]['species_id']+'.png';
				else stats +='http://wahackpokemon.com/dex/sprites/forms/'+o[i]['id']+'.png';
				stats +='">';
		if(totalKeyPre != totalKey) stats += '<i class="f">'+total+'</i>';
		stats += '</span>';
		if(totalKeyPre != totalKey) stats += '<div class="formstats">'+statshtml+'</div>';
		typeKey = o[i].ty1+''+o[i].ty2; 
		if(typeKeyPre != typeKey) if(!o[i].ty2) stats += '<div class="formtype"><a class="typq ty'+o[i].ty1+'" href="#type/index/'+o[i].ty1+'">'+o[i].ty1name+'</a></div>'; else stats += '<div class="fifty formtype"><div><a class="typq ty'+o[i].ty1+'" href="#type/index/'+o[i].ty1+'">'+o[i].ty1name+'</a></div><div><a class="typq ty'+o[i].ty2+'" href="#type/index/'+o[i].ty2+'">'+o[i].ty2name+'</a></div></div>';
		stats += '<div class="formabilities">'+(o[i].an1?o[i].an1:'')+(o[i].an2?' | '+o[i].an2:'')+(o[i].an3?' | '+o[i].an3:'')+'</div>';
		stats += '</div>';
		h2=true; totalKeyPre = totalKey; typeKeyPre = typeKey;
	}
	$('article').removeClass('fadeIn').addClass('fadeOut');
	setTimeout(function(){
		$('article').html(stats+'</section>').removeClass('fadeOut').addClass('fadeIn');
		setEvents();
		$('#nav td:eq(3)').addClass('f');
	}, 200 );
}}, type : { index: function(o) {
	var html = chrome.type[0]+'<section id="type">';
	html += '<h2 class="f">'+l10n[hl].attack+'</h2><div class="typebars att">';
	for(i in o.attack) 
		html += '<a href="#type/index/'+i+'"><i class="ty'+i+'" style="height:'+ o.attack[i]*0.02 +'em;'+(o.attack[i]==100?'opacity:0.4':'')+'"></i></a>';
	html += '</div><div class="typebars def">';
	for(i in o.defense) 
		html += '<a href="#type/index/'+i+'"><i class="ty'+i+'" style="height:'+ o.defense[i]*0.02 +'em;'+(o.defense[i]==100?'opacity:0.4':'')+'"></i></a>';
	html += '</div><h2 class="f">'+l10n[hl].defense+'</h2>';
	$('article').removeClass('fadeIn').addClass('fadeOut');
	setTimeout(function(){
		$('article').html(html+'</section>').removeClass('fadeOut').addClass('fadeIn');
		setEvents();
		$('#nav td:eq(0)').addClass('f');
	}, 200 );
}, moves: function(o) {
	var html = chrome.type[0]+'<section id="moves"><div>';
	for(var i=0;i<o.length;i++)
		html+='<a href="#move/index/'+o[i].id+'" class="ty ty'+o[i].type_id+'"><span>'+o[i].name+'</span>'
		+'<i class="mcl movcl'+o[i]['class']+'">✶</i><i class="acc">'+(o[i].accuracy>0?o[i].accuracy+'%':'-')+'</i>'
		+'<i class="ppo">'+o[i].pp+' pp</i><i class="pow">'+(o[i].power>0?o[i].power:'-')+'</i></a>';
	html +='</div>';
	$('article').removeClass('fadeIn').addClass('fadeOut');
	setTimeout(function(){
		$('article').html(html+'</section>').removeClass('fadeOut').addClass('fadeIn');
		setEvents();
		$('#nav td:eq(1)').addClass('f');
	}, 200 );
}, pokemon: function(o) {
	var html = chrome.type[0]+'<section id="pokemon"><ul>';
	for(var i=0;i<o.length;i++)
		html += '<li><a href="#pokemon/index/'+o[i]['id']+'">'+o[i]['name']
			+'<span><i class="typq ty'+o[i].ty1+'" >'+o[i].ty1name+'</i>'
			+(o[i].ty2 ?' / <i class="typq ty'+o[i].ty2+'">'+o[i].ty2name+'</i>':'')+'</span></a></li>';
	html +='</ul>';
	$('article').removeClass('fadeIn').addClass('fadeOut');
	setTimeout(function(){
		$('article').html(html+'</section>').removeClass('fadeOut').addClass('fadeIn');
		setEvents();
		$('#nav td:eq(2)').addClass('f');
	}, 200 );
}}};

window.onpopstate = function(event) {
	if(window.location.hash) {
		var hash = window.location.hash.substring(1);
		search(event,hash);
	};
};