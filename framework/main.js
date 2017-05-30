/* Content Key:
 * \n\n---\n\n	section break
 * \n\n\n		sub-section break
 * \n\n			paragraph break
 * \n			line break
*/

function get(theUrl, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getMatches(regex, string) {
	var matches = [];
	var match;
	while (match = regex.exec(string)) {
		matches.push(match);
	}
	return matches;
}

var search = location.search.substring(1);
var urlParams = {};
if (search) try {
	urlParams = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function(key, value) {
		return key === "" ? value : decodeURIComponent(value)
	});
} catch (e) {}

function stripComments(t){
	return t.replace(/\[\[(.+)+\]\]/gi, "")/*.replace(/\[\[\s(.+)+\s\]\]/gi, "");*/
	//return t.replace(/\[\[\s+?(.+)+\s+?\]\]/gi, "");
}
function markdown(t) {
	//return t
	
	var matches;
	var linkCheck = /\[([^\]]+)\]\(([^\)]+)\)/i;
	while(matches = linkCheck.exec(t)){
		t = t.replace(linkCheck, '<a href="' + matches[2].toHtmlEntities() + '" target="&#95;blank">' + matches[1].toHtmlEntities() + '</a>');
	}
	
	/*var htmlCheck = /<<\s?(.+)+\s?>>/i;
	while(matches = htmlCheck.exec(t)){
		t = t.replace(htmlCheck, matches[1].fromHtmlEntities());
	}*/
	var htmlEscapedCheck = /&lt;&lt;(.+)+&gt;&gt;/i;
	while(matches = htmlEscapedCheck.exec(t)){
		t = t.replace(htmlEscapedCheck, matches[1].fromHtmlEntities());
	}
	
	//.replace(/\<[\S\s]+\>/g, "")
	//.replace(/\<\/[\S\s]+\>/g, "")
	t = t.replace(/\*([^*\n]+)+\*/gi, "<strong>$1</strong>")
	t = t.replace(/\_([^_\n]+)+\_/gi, "<em>$1</em>")
	.replace(/```([^```]+)+```/gi, "<pre>$1</pre>")
	
	.replace(/`([^`\n]+)+`/gi, "<code>$1</code>")
	/*var codeCheck = /`([^`\n]+)+`/i;
	while(matches = codeCheck.exec(t)){
		t = t.replace(codeCheck, "<code>" + matches[1].fromHtmlEntities() + "</code>");
	}*/
	
	//.replace(/{{\n?(.+)+\n?}}/gi, "<aside>$1</aside>")
	t = t.replace(/{{\n?/gi, "<aside>")
	.replace(/\n?}}/gi, "</aside>")
	
	//.replace(/(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/gi, "<a href=\"$2.$3\">$2.$3$4</a>")
	//.replace(/[\r\n|\n]+/g, "<br>")
	
	return t;
}

function paragraphIt(content){
	return "<div>" + content.split("\n\n\n").map(function(subsection){
		return subsection.split("\n\n").map(function(paragraph){
			var ol = false;
			var ul = false;
			var t = "<p>";
			var lines = paragraph.split("\n");
			lines.forEach(function(line, l){
				var olIndex = line.indexOf(". ");
				if(!ol && !isNaN(line[0]) && olIndex > 0){
					ol = true;
					t += "</p><ol>";
				}
				if(ol && !(!isNaN(line[0]) && olIndex > 0)){
					ol = false;
					t += "</ol><p>";
				}
				
				var ulIndex = line.indexOf("- ");
				if(!ul && ulIndex === 0){
					ul = true;
					t += "</p><ul>";
				}
				if(ul && ulIndex !== 0){
					ul = false;
					t += "</ul><p>";
				}
				
				if(ol || ul){
					t += "<li>" + line.slice((ol ? olIndex : ulIndex) + 2) + "</li>";
				}else{
					t += line + (l === lines.length - 1 ? "" : "<br>");
				}
			});
			if(ol) t += "</ol>";
			return t + "</p>";
		}).join("");
	}).join("</div><div>") + "</div>";
}

(function() {
	// this prevents any overhead from creating the object each time
	var element = document.createElement('div');

	// regular expression matching HTML entities
	var entity = /&(?:#x[a-f0-9]+|#[0-9]+|[a-z0-9]+);?/ig;

	String.prototype.fromHtmlEntities = function() {
		var str = this;
		// find and replace all the html entities
		str = str.replace(entity, function(m) {
			element.innerHTML = m;
			return element.textContent;
		});

		// reset the value
		element.textContent = '';

		return str;
	}
})();

String.prototype.toHtmlEntities = function() {
    return this.replace(/./gm, function(s) {
        return "&#" + s.charCodeAt(0) + ";";
    });
};
String.prototype.ltToHtmlEntities = function() {
    return this.replace(/(<)/gi, "&lt;").replace(/(>)/gi, "&gt;")
};
/*String.prototype.fromHtmlEntities = function() {
    return this.replace(/&#\d+;/gm,function(s) {
        return String.fromCharCode(s.match(/\d+/gm)[0]);
    })
};*/


// https://github.com/sindresorhus/strip-indent/blob/master/index.js
function stripIndent(str){
	const match = str.match(/^[ \t]*(?=\S)/gm);

	if (!match) {
		return str;
	}

	// TODO: use spread operator when targeting Node.js 6
	const indent = Math.min.apply(Math, match.map(x => x.length)); // eslint-disable-line
	const re = new RegExp(`^[ \\t]{${indent}}`, 'gm');

	return indent > 0 ? str.replace(re, '') : str;
}





$(function() {
	//$("header h1").slabText();
});

var $main = $("main");

$(document.body).keydown(function(e) {
	switch(e.keyCode){
		case 32:
		case 38:
		case 40:
			return false;
	}
});
$(document.body).keyup(function(e) {
	switch(e.keyCode){
		case 27: // esc
			$("body").removeClass("slides-mode");
			break;
		case 8: // backspace
		case 38: // up
			previousSlide();
			break;
		case 13: // enter
		case 32: // space
		case 40: // down
			nextSlide();
	}
})

function previousSlide(){
	if(!jQuery.fn.reverse) jQuery.fn.reverse = [].reverse;
	$main.find("section").reverse().each(function() {
		var top = this.getBoundingClientRect().top;
		if (top < -1) {
			$("html, body").animate({
				scrollTop: $(this).offset().top
			}, 500);
			return false;
		}
	});
	return false;
}
function nextSlide(){
	$main.find("section").each(function() {
		var top = this.getBoundingClientRect().top;console.log(this, top, this.getBoundingClientRect())
		if (top > 1) {
			$("body").addClass("slides-mode");
			$("html, body").animate({
				scrollTop: $(this).offset().top
			}, 500);
			return false;
		}
	});
	return false;
}

var url = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
url = url.split("/");
url.pop();
url = url.join("/");
if(urlParams.week && !isNaN(urlParams.week)) url += "/week-" + urlParams.week;
url += "/content.html?" + Date.now();
get(url, function(data){
	var sections = data.split("\n\n---\n\n");
	var settings = {};
	sections.forEach(function(section, i){
		var parts = markdown(stripComments(section.ltToHtmlEntities())).split("\n\n");
		var headings = parts.shift().split("\n");
		parts = parts.join("\n\n");
		if(i === 0){
			// Header
			var mainTitle = headings.shift();
			$("title").html(mainTitle + $("title").html());
			$("header h1").html(mainTitle);
			$("header h2").html(headings.shift());
			if(headings.length) settings = JSON.parse(headings[0]);
		}else if(i === sections.length - 1){
			// Footer
			$("footer h1").html(headings.shift());
			$("footer h2").html(headings.shift());
			$(".copyright").html(headings.shift());
		}else if(headings[0][0] === "@"){
			// Day Intro
			var $section = $("#wrapper-template .day-intro").clone().appendTo($main);
			$section.find("h2").html(headings.shift().slice(1));
			$section.find("h3").html(headings.shift());
			parts ? $section.find("aside").html(paragraphIt(parts)) : $section.find("aside").remove();
		}else{
			// Regular Section
			var $section = $("#wrapper-template .content-section").clone().appendTo($main);
			$section.find("h2").html(headings.shift());
			
			parts = parts.split("\n\n\n")
			var regularContent = [];
			var code = [];
			parts.forEach(function(line){
				if(line.indexOf("\t") === 0 || line.indexOf("\t") === 1){
					if(line[0] === "0"){
						line = line.slice(1);
						$section.find(".content-wrapper").addClass("editor-code-only");
					}else if(line[0] === "1"){
						line = line.slice(1);
						$section.find(".content-wrapper").addClass("editor-output-only");
					}else if(line[0] === "2"){
						line = line.slice(1);
						$section.find(".content-wrapper").addClass("editor-half");
					}else if(line[0] === "3"){
						line = line.slice(1);
						$section.find(".content-wrapper").addClass("editor-only");
					}else if(line[0] === "4"){
						line = line.slice(1);
						$section.find(".content-wrapper").addClass("editor-400");
					}else if(line[0] === "5"){
						line = line.slice(1);
						$section.find(".content-wrapper").addClass("editor-two-fifth");
					}else if(line[0] === "6"){
						line = line.slice(1);
						$section.find(".content-wrapper").addClass("editor-400 editor-output-only");
					}
					code.push(line);
				}else{
					regularContent.push(line);
				}
			})
			parts = regularContent;
			
			$section.find(".content").html(paragraphIt(parts.join("\n\n\n")));
			$section.find(".editor").text(code.join("\n").fromHtmlEntities());
		}
	});
	
	var previousCode = "";
	$("iframe.editor").each(function() {
		var code = stripIndent(this.innerHTML.fromHtmlEntities()).trim();
		var $contentWrapper = $(this).closest(".content-wrapper");
		if(code && !urlParams["no-editors"]){
			if(urlParams["start-blank"] === "1") code = "";
			if(urlParams["offset"] === "1"){
				var _code = code;
				code = previousCode;
				previousCode = _code;
			}
		}else{
			$contentWrapper.addClass("no-editor");
			$(this).remove();
		}

		var src = "/live-editor/index.html?code=" + encodeURIComponent(code);
		if($contentWrapper.hasClass("editor-code-only")) src += "&output=0";
		if($contentWrapper.hasClass("editor-output-only")) src += "&editor=0";
		if(settings.mode) src += "&mode=" + settings.mode;

		//var editor = $("iframe").addClass("editor").attr("src", src);
		//$(this).replaceWith(editor);
		this.src = src;
		this.allowFullscreen = true;
	})
	
	$("body").addClass("loaded");
});

hljs.initHighlightingOnLoad();