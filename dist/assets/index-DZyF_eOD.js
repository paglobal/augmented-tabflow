(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function e(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(s){if(s.ep)return;s.ep=!0;const n=e(s);fetch(s.href,n)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const J=globalThis,ft=J.ShadowRoot&&(J.ShadyCSS===void 0||J.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,vt=Symbol(),wt=new WeakMap;let Dt=class{constructor(t,e,r){if(this._$cssResult$=!0,r!==vt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(ft&&t===void 0){const r=e!==void 0&&e.length===1;r&&(t=wt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&wt.set(e,t))}return t}toString(){return this.cssText}};const pe=o=>new Dt(typeof o=="string"?o:o+"",void 0,vt),tt=(o,...t)=>{const e=o.length===1?o[0]:t.reduce((r,s,n)=>r+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[n+1],o[0]);return new Dt(e,o,vt)},be=(o,t)=>{if(ft)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const r=document.createElement("style"),s=J.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=e.cssText,o.appendChild(r)}},At=ft?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(const r of t.cssRules)e+=r.cssText;return pe(e)})(o):o;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:fe,defineProperty:ve,getOwnPropertyDescriptor:ge,getOwnPropertyNames:me,getOwnPropertySymbols:ye,getPrototypeOf:_e}=Object,w=globalThis,Ct=w.trustedTypes,$e=Ct?Ct.emptyScript:"",ot=w.reactiveElementPolyfillSupport,V=(o,t)=>o,Y={toAttribute(o,t){switch(t){case Boolean:o=o?$e:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},gt=(o,t)=>!fe(o,t),Et={attribute:!0,type:String,converter:Y,reflect:!1,hasChanged:gt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),w.litPropertyMetadata??(w.litPropertyMetadata=new WeakMap);class k extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Et){if(e.state&&(e.attribute=!1),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const r=Symbol(),s=this.getPropertyDescriptor(t,r,e);s!==void 0&&ve(this.prototype,t,s)}}static getPropertyDescriptor(t,e,r){const{get:s,set:n}=ge(this.prototype,t)??{get(){return this[e]},set(i){this[e]=i}};return{get(){return s==null?void 0:s.call(this)},set(i){const a=s==null?void 0:s.call(this);n.call(this,i),this.requestUpdate(t,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Et}static _$Ei(){if(this.hasOwnProperty(V("elementProperties")))return;const t=_e(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(V("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(V("properties"))){const e=this.properties,r=[...me(e),...ye(e)];for(const s of r)this.createProperty(s,e[s])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[r,s]of e)this.elementProperties.set(r,s)}this._$Eh=new Map;for(const[e,r]of this.elementProperties){const s=this._$Eu(e,r);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const r=new Set(t.flat(1/0).reverse());for(const s of r)e.unshift(At(s))}else t!==void 0&&e.push(At(t));return e}static _$Eu(t,e){const r=e.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$Eg=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$ES(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$E_??(this._$E_=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$E_)==null||e.delete(t)}_$ES(){const t=new Map,e=this.constructor.elementProperties;for(const r of e.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return be(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$E_)==null||t.forEach(e=>{var r;return(r=e.hostConnected)==null?void 0:r.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$E_)==null||t.forEach(e=>{var r;return(r=e.hostDisconnected)==null?void 0:r.call(e)})}attributeChangedCallback(t,e,r){this._$AK(t,r)}_$EO(t,e){var n;const r=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,r);if(s!==void 0&&r.reflect===!0){const i=(((n=r.converter)==null?void 0:n.toAttribute)!==void 0?r.converter:Y).toAttribute(e,r.type);this._$Em=t,i==null?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(t,e){var n;const r=this.constructor,s=r._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const i=r.getPropertyOptions(s),a=typeof i.converter=="function"?{fromAttribute:i.converter}:((n=i.converter)==null?void 0:n.fromAttribute)!==void 0?i.converter:Y;this._$Em=s,this[s]=a.fromAttribute(e,i.type),this._$Em=null}}requestUpdate(t,e,r){if(t!==void 0){if(r??(r=this.constructor.getPropertyOptions(t)),!(r.hasChanged??gt)(this[t],e))return;this.C(t,e,r)}this.isUpdatePending===!1&&(this._$Eg=this._$EP())}C(t,e,r){this._$AL.has(t)||this._$AL.set(t,e),r.reflect===!0&&this._$Em!==t&&(this._$ET??(this._$ET=new Set)).add(t)}async _$EP(){this.isUpdatePending=!0;try{await this._$Eg}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var r;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,i]of this._$Ep)this[n]=i;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[n,i]of s)i.wrapped!==!0||this._$AL.has(n)||this[n]===void 0||this.C(n,this[n],i)}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(r=this._$E_)==null||r.forEach(s=>{var n;return(n=s.hostUpdate)==null?void 0:n.call(s)}),this.update(e)):this._$Ej()}catch(s){throw t=!1,this._$Ej(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$E_)==null||e.forEach(r=>{var s;return(s=r.hostUpdated)==null?void 0:s.call(r)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ej(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Eg}shouldUpdate(t){return!0}update(t){this._$ET&&(this._$ET=this._$ET.forEach(e=>this._$EO(e,this[e]))),this._$Ej()}updated(t){}firstUpdated(t){}}k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[V("elementProperties")]=new Map,k[V("finalized")]=new Map,ot==null||ot({ReactiveElement:k}),(w.reactiveElementVersions??(w.reactiveElementVersions=[])).push("2.0.3");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const U=globalThis,G=U.trustedTypes,xt=G?G.createPolicy("lit-html",{createHTML:o=>o}):void 0,Ht="$lit$",$=`lit$${(Math.random()+"").slice(9)}$`,jt="?"+$,we=`<${jt}>`,x=document,I=()=>x.createComment(""),F=o=>o===null||typeof o!="object"&&typeof o!="function",qt=Array.isArray,Ae=o=>qt(o)||typeof(o==null?void 0:o[Symbol.iterator])=="function",rt=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,St=/-->/g,kt=/>/g,A=RegExp(`>|${rt}(?:([^\\s"'>=/]+)(${rt}*=${rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Pt=/'/g,Mt=/"/g,Wt=/^(?:script|style|textarea|title)$/i,Ce=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),H=Ce(1),m=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),Lt=new WeakMap,E=x.createTreeWalker(x,129);function Zt(o,t){if(!Array.isArray(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return xt!==void 0?xt.createHTML(t):t}const Ee=(o,t)=>{const e=o.length-1,r=[];let s,n=t===2?"<svg>":"",i=L;for(let a=0;a<e;a++){const l=o[a];let u,b,d=-1,v=0;for(;v<l.length&&(i.lastIndex=v,b=i.exec(l),b!==null);)v=i.lastIndex,i===L?b[1]==="!--"?i=St:b[1]!==void 0?i=kt:b[2]!==void 0?(Wt.test(b[2])&&(s=RegExp("</"+b[2],"g")),i=A):b[3]!==void 0&&(i=A):i===A?b[0]===">"?(i=s??L,d=-1):b[1]===void 0?d=-2:(d=i.lastIndex-b[2].length,u=b[1],i=b[3]===void 0?A:b[3]==='"'?Mt:Pt):i===Mt||i===Pt?i=A:i===St||i===kt?i=L:(i=A,s=void 0);const _=i===A&&o[a+1].startsWith("/>")?" ":"";n+=i===L?l+we:d>=0?(r.push(u),l.slice(0,d)+Ht+l.slice(d)+$+_):l+$+(d===-2?a:_)}return[Zt(o,n+(o[e]||"<?>")+(t===2?"</svg>":"")),r]};class D{constructor({strings:t,_$litType$:e},r){let s;this.parts=[];let n=0,i=0;const a=t.length-1,l=this.parts,[u,b]=Ee(t,e);if(this.el=D.createElement(u,r),E.currentNode=this.el.content,e===2){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=E.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(const d of s.getAttributeNames())if(d.endsWith(Ht)){const v=b[i++],_=s.getAttribute(d).split($),W=/([.?@])?(.*)/.exec(v);l.push({type:1,index:n,name:W[2],strings:_,ctor:W[1]==="."?Se:W[1]==="?"?ke:W[1]==="@"?Pe:et}),s.removeAttribute(d)}else d.startsWith($)&&(l.push({type:6,index:n}),s.removeAttribute(d));if(Wt.test(s.tagName)){const d=s.textContent.split($),v=d.length-1;if(v>0){s.textContent=G?G.emptyScript:"";for(let _=0;_<v;_++)s.append(d[_],I()),E.nextNode(),l.push({type:2,index:++n});s.append(d[v],I())}}}else if(s.nodeType===8)if(s.data===jt)l.push({type:2,index:n});else{let d=-1;for(;(d=s.data.indexOf($,d+1))!==-1;)l.push({type:7,index:n}),d+=$.length-1}n++}}static createElement(t,e){const r=x.createElement("template");return r.innerHTML=t,r}}function M(o,t,e=o,r){var i,a;if(t===m)return t;let s=r!==void 0?(i=e._$Co)==null?void 0:i[r]:e._$Cl;const n=F(t)?void 0:t._$litDirective$;return(s==null?void 0:s.constructor)!==n&&((a=s==null?void 0:s._$AO)==null||a.call(s,!1),n===void 0?s=void 0:(s=new n(o),s._$AT(o,e,r)),r!==void 0?(e._$Co??(e._$Co=[]))[r]=s:e._$Cl=s),s!==void 0&&(t=M(o,s._$AS(o,t.values),s,r)),t}class xe{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:r}=this._$AD,s=((t==null?void 0:t.creationScope)??x).importNode(e,!0);E.currentNode=s;let n=E.nextNode(),i=0,a=0,l=r[0];for(;l!==void 0;){if(i===l.index){let u;l.type===2?u=new j(n,n.nextSibling,this,t):l.type===1?u=new l.ctor(n,l.name,l.strings,this,t):l.type===6&&(u=new Me(n,this,t)),this._$AV.push(u),l=r[++a]}i!==(l==null?void 0:l.index)&&(n=E.nextNode(),i++)}return E.currentNode=x,s}p(t){let e=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,e),e+=r.strings.length-2):r._$AI(t[e])),e++}}class j{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,r,s){this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=r,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=M(this,t,e),F(t)?t===f||t==null||t===""?(this._$AH!==f&&this._$AR(),this._$AH=f):t!==this._$AH&&t!==m&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):Ae(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==f&&F(this._$AH)?this._$AA.nextSibling.data=t:this.$(x.createTextNode(t)),this._$AH=t}g(t){var n;const{values:e,_$litType$:r}=t,s=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=D.createElement(Zt(r.h,r.h[0]),this.options)),r);if(((n=this._$AH)==null?void 0:n._$AD)===s)this._$AH.p(e);else{const i=new xe(s,this),a=i.u(this.options);i.p(e),this.$(a),this._$AH=i}}_$AC(t){let e=Lt.get(t.strings);return e===void 0&&Lt.set(t.strings,e=new D(t)),e}T(t){qt(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let r,s=0;for(const n of t)s===e.length?e.push(r=new j(this.k(I()),this.k(I()),this,this.options)):r=e[s],r._$AI(n),s++;s<e.length&&(this._$AR(r&&r._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var r;for((r=this._$AP)==null?void 0:r.call(this,!1,!0,e);t&&t!==this._$AB;){const s=t.nextSibling;t.remove(),t=s}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,r,s,n){this.type=1,this._$AH=f,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=f}_$AI(t,e=this,r,s){const n=this.strings;let i=!1;if(n===void 0)t=M(this,t,e,0),i=!F(t)||t!==this._$AH&&t!==m,i&&(this._$AH=t);else{const a=t;let l,u;for(t=n[0],l=0;l<n.length-1;l++)u=M(this,a[r+l],e,l),u===m&&(u=this._$AH[l]),i||(i=!F(u)||u!==this._$AH[l]),u===f?t=f:t!==f&&(t+=(u??"")+n[l+1]),this._$AH[l]=u}i&&!s&&this.O(t)}O(t){t===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Se extends et{constructor(){super(...arguments),this.type=3}O(t){this.element[this.name]=t===f?void 0:t}}class ke extends et{constructor(){super(...arguments),this.type=4}O(t){this.element.toggleAttribute(this.name,!!t&&t!==f)}}class Pe extends et{constructor(t,e,r,s,n){super(t,e,r,s,n),this.type=5}_$AI(t,e=this){if((t=M(this,t,e,0)??f)===m)return;const r=this._$AH,s=t===f&&r!==f||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,n=t!==f&&(r===f||s);s&&this.element.removeEventListener(this.name,this,r),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class Me{constructor(t,e,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t)}}const st=U.litHtmlPolyfillSupport;st==null||st(D,j),(U.litHtmlVersions??(U.litHtmlVersions=[])).push("3.1.1");const Kt=(o,t,e)=>{const r=(e==null?void 0:e.renderBefore)??t;let s=r._$litPart$;if(s===void 0){const n=(e==null?void 0:e.renderBefore)??null;r._$litPart$=s=new j(t.insertBefore(I(),n),n,void 0,e??{})}return s._$AI(o),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let R=class extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Kt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return m}};var Ft;R._$litElement$=!0,R.finalized=!0,(Ft=globalThis.litElementHydrateSupport)==null||Ft.call(globalThis,{LitElement:R});const nt=globalThis.litElementPolyfillSupport;nt==null||nt({LitElement:R});(globalThis.litElementVersions??(globalThis.litElementVersions=[])).push("4.0.3");function Le(o,t){(typeof t.renderContainer=="string"||t.renderContainer instanceof String)&&(t.renderContainer=document.querySelector(t.renderContainer));const e=()=>Kt(o(),t.renderContainer,t.renderOptions);return e(),e}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Te=(o,t)=>t===void 0?(o==null?void 0:o._$litType$)!==void 0:(o==null?void 0:o._$litType$)===t,ze=o=>o.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Jt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Yt=o=>(...t)=>({_$litDirective$:o,values:t});class Gt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,r){this._$Ct=t,this._$AM=e,this._$Ci=r}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const B=(o,t)=>{var r;const e=o._$AN;if(e===void 0)return!1;for(const s of e)(r=s._$AO)==null||r.call(s,t,!1),B(s,t);return!0},Q=o=>{let t,e;do{if((t=o._$AM)===void 0)break;e=t._$AN,e.delete(o),o=t}while((e==null?void 0:e.size)===0)},Qt=o=>{for(let t;t=o._$AM;o=t){let e=t._$AN;if(e===void 0)t._$AN=e=new Set;else if(e.has(o))break;e.add(o),Ve(t)}};function Oe(o){this._$AN!==void 0?(Q(this),this._$AM=o,Qt(this)):this._$AM=o}function Ne(o,t=!1,e=0){const r=this._$AH,s=this._$AN;if(s!==void 0&&s.size!==0)if(t)if(Array.isArray(r))for(let n=e;n<r.length;n++)B(r[n],!1),Q(r[n]);else r!=null&&(B(r,!1),Q(r));else B(this,o)}const Ve=o=>{o.type==Jt.CHILD&&(o._$AP??(o._$AP=Ne),o._$AQ??(o._$AQ=Oe))};class Ue extends Gt{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,r){super._$AT(t,e,r),Qt(this),this.isConnected=t._$AU}_$AO(t,e=!0){var r,s;t!==this.isConnected&&(this.isConnected=t,t?(r=this.reconnected)==null||r.call(this):(s=this.disconnected)==null||s.call(this)),e&&(B(this,t),Q(this))}setValue(t){if(ze(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}const X=[];function Xt(o){var t;let e=o.cleanupTree;return(t=o.cleanupTreeNodePointer)===null||t===void 0||t.forEach(r=>{e=e==null?void 0:e.get(r)}),e}function Re(o){o.observableSubscriptionSets.forEach(t=>{t.delete(o)}),o.observableSubscriptionSets.clear()}function te(o,t){var e;o.childCount=0;const r=(e=Xt(o))===null||e===void 0?void 0:e.get(0);r==null||r.forEach(s=>{s()}),r==null||r.clear(),X.push(o),t(r),r==null||r.add(()=>Re(o)),X.pop()}function ee(o){let t=0;for(;o!=null&&o.get(t);){if(t===0){const e=o.get(0);e.forEach(r=>{r()}),e.clear()}else{const e=o.get(t);ee(e)}t++}}function oe(o){const t=Xt(o);ee(t)}function Be(o,t){return te(o,e=>Ie(o,t,e)),()=>oe(o)}function Ie(o,t,e){const r=t(o.returnValue),s=()=>{typeof r=="function"&&(o.returnValue=r())};e==null||e.add(s)}function Fe(o,t,e,r={}){return te(o,s=>De(o,t,e,r,s)),()=>oe(o)}function De(o,t,e,r={},s){if(o.firstRun&&r.defer)o.firstRun=!1;else{const n=t(o.returnValue,o.argsArray),i=()=>{typeof n=="function"&&(o.returnValue=n())};s==null||s.add(i)}o.tracking="implicit",o.argsArray=e.map(n=>n()),o.tracking="depArray"}const He={implicit:Be,depArray:Fe},je=[],qe=[];let it=!0;function We(o){const t=it?je:qe,e=!it;t.push(o),t.length===1&&setTimeout(()=>{it=e,t.forEach(r=>r()),t.length=0})}const Ze=[],Ke=[];let lt=!0;function Je(o){const t=lt?Ze:Ke,e=!lt;t.push(o),t.length===1&&queueMicrotask(()=>{lt=e,t.forEach(r=>r()),t.length=0})}function Ye(o,t,e,r,s){r==="stale"?(o.staleStateValuesCount++,o.falseAlarmSignalsCount++):(r==="fresh"||r==="falseAlarm")&&(o.staleStateValuesCount--,r==="falseAlarm"&&o.falseAlarmSignalsCount--,o.staleStateValuesCount<=0&&(o.falseAlarmSignalsCount>0&&Ge[o.type](o,t,e,s),o.falseAlarmSignalsCount=0,o.staleStateValuesCount=0))}const Ge={sync:(o,t,e,r)=>t(o,e,r),async:(o,t,e,r)=>We(()=>t(o,e,r)),render:(o,t,e,r)=>Je(()=>t(o,e,r))};function Qe(o){const t=X[X.length-1];if(t){t.childCount++,o.position=t.childCount,o.level=t.level+1,o.cleanupTree=t.cleanupTree,o.cleanupTreeNodePointer=[...t.cleanupTreeNodePointer];let e=o.cleanupTreeNodePointer.length;e===o.level?o.cleanupTreeNodePointer[e-1]=o.position:e<o.level?o.cleanupTreeNodePointer[e]=o.position:e>o.level&&(o.cleanupTreeNodePointer.pop(),o.cleanupTreeNodePointer[e-2]=o.position)}else o.level=1,o.position=1,o.cleanupTreeNodePointer=[1],o.cleanupTree=new Map}function Xe(o){var t;let e=o.cleanupTree;(t=o.cleanupTreeNodePointer)===null||t===void 0||t.forEach(r=>{e!=null&&e.get(r)||e==null||e.set(r,new Map),e=e==null?void 0:e.get(r)}),e!=null&&e.get(0)||e==null||e.set(0,new Set)}function to(o,t,e,r){const s=He[t],n={firstRun:!0,type:o,tracking:t,childCount:0,position:null,level:null,cleanupTree:null,cleanupTreeNodePointer:null,observableSubscriptionSets:new Set,staleStateValuesCount:0,falseAlarmSignalsCount:0,sendSignal:i=>Ye(n,s,e,i,r)};return Qe(n),Xe(n),[s,n]}function Tt(o,t,e){const r=typeof t>"u"?"implicit":"depArray",[s,n]=to("sync",r,o,t);return s(n,o,t,e)}class eo extends Ue{constructor(t){super(t),this.updateFlag="initialize",this.cleanups=[]}disconnected(){this.cleanups.forEach(t=>t())}initialize(t,e,r){return this.props=t,this.initializeComponent(r,this.props)}initializeComponent(t,e){let r;this.cleanups.push(Tt(()=>{r=t(e)},[]));let s;const n=Tt(()=>{s=r(),this.updateFlag!=="initialize"&&this.setValue(s)});return this.cleanups.push(n),this.updateFlag="updateProps",s}update(t,[e,r]){return this[this.updateFlag](r,t,e)}reconnected(){this.updateFlag="initialize"}render(){return m}updateProps(t){for(const e in t)this.props[e]=t[e];return m}}const oo=Yt(eo);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const g=o=>o??f;var mt=tt`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden] {
    display: none !important;
  }
`,ro=tt`
  ${mt}

  :host {
    --track-width: 2px;
    --track-color: rgb(128 128 128 / 25%);
    --indicator-color: var(--sl-color-primary-600);
    --speed: 2s;

    display: inline-flex;
    width: 1em;
    height: 1em;
  }

  .spinner {
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
  }

  .spinner__track,
  .spinner__indicator {
    fill: none;
    stroke-width: var(--track-width);
    r: calc(0.5em - var(--track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
    transform-origin: 50% 50%;
  }

  .spinner__track {
    stroke: var(--track-color);
    transform-origin: 0% 0%;
  }

  .spinner__indicator {
    stroke: var(--indicator-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    animation: spin var(--speed) linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      stroke-dasharray: 0.01em, 2.75em;
    }

    50% {
      transform: rotate(450deg);
      stroke-dasharray: 1.375em, 1.375em;
    }

    100% {
      transform: rotate(1080deg);
      stroke-dasharray: 0.01em, 2.75em;
    }
  }
`;const ht=new Set,so=new MutationObserver(ie),P=new Map;let re=document.documentElement.dir||"ltr",se=document.documentElement.lang||navigator.language,C;so.observe(document.documentElement,{attributes:!0,attributeFilter:["dir","lang"]});function ne(...o){o.map(t=>{const e=t.$code.toLowerCase();P.has(e)?P.set(e,Object.assign(Object.assign({},P.get(e)),t)):P.set(e,t),C||(C=t)}),ie()}function ie(){re=document.documentElement.dir||"ltr",se=document.documentElement.lang||navigator.language,[...ht.keys()].map(o=>{typeof o.requestUpdate=="function"&&o.requestUpdate()})}let no=class{constructor(t){this.host=t,this.host.addController(this)}hostConnected(){ht.add(this.host)}hostDisconnected(){ht.delete(this.host)}dir(){return`${this.host.dir||re}`.toLowerCase()}lang(){return`${this.host.lang||se}`.toLowerCase()}getTranslationData(t){var e,r;const s=new Intl.Locale(t.replace(/_/g,"-")),n=s==null?void 0:s.language.toLowerCase(),i=(r=(e=s==null?void 0:s.region)===null||e===void 0?void 0:e.toLowerCase())!==null&&r!==void 0?r:"",a=P.get(`${n}-${i}`),l=P.get(n);return{locale:s,language:n,region:i,primary:a,secondary:l}}exists(t,e){var r;const{primary:s,secondary:n}=this.getTranslationData((r=e.lang)!==null&&r!==void 0?r:this.lang());return e=Object.assign({includeFallback:!1},e),!!(s&&s[t]||n&&n[t]||e.includeFallback&&C&&C[t])}term(t,...e){const{primary:r,secondary:s}=this.getTranslationData(this.lang());let n;if(r&&r[t])n=r[t];else if(s&&s[t])n=s[t];else if(C&&C[t])n=C[t];else return console.error(`No translation found for: ${String(t)}`),String(t);return typeof n=="function"?n(...e):n}date(t,e){return t=new Date(t),new Intl.DateTimeFormat(this.lang(),e).format(t)}number(t,e){return t=Number(t),isNaN(t)?"":new Intl.NumberFormat(this.lang(),e).format(t)}relativeTime(t,e,r){return new Intl.RelativeTimeFormat(this.lang(),r).format(t,e)}};var le={$code:"en",$name:"English",$dir:"ltr",carousel:"Carousel",clearEntry:"Clear entry",close:"Close",copied:"Copied",copy:"Copy",currentValue:"Current value",error:"Error",goToSlide:(o,t)=>`Go to slide ${o} of ${t}`,hidePassword:"Hide password",loading:"Loading",nextSlide:"Next slide",numOptionsSelected:o=>o===0?"No options selected":o===1?"1 option selected":`${o} options selected`,previousSlide:"Previous slide",progress:"Progress",remove:"Remove",resize:"Resize",scrollToEnd:"Scroll to end",scrollToStart:"Scroll to start",selectAColorFromTheScreen:"Select a color from the screen",showPassword:"Show password",slideNum:o=>`Slide ${o}`,toggleColorFormat:"Toggle color format"};ne(le);var io=le,ae=class extends no{};ne(io);var ce=Object.defineProperty,lo=Object.defineProperties,ao=Object.getOwnPropertyDescriptor,co=Object.getOwnPropertyDescriptors,zt=Object.getOwnPropertySymbols,uo=Object.prototype.hasOwnProperty,ho=Object.prototype.propertyIsEnumerable,Ot=(o,t,e)=>t in o?ce(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e,q=(o,t)=>{for(var e in t||(t={}))uo.call(t,e)&&Ot(o,e,t[e]);if(zt)for(var e of zt(t))ho.call(t,e)&&Ot(o,e,t[e]);return o},ue=(o,t)=>lo(o,co(t)),c=(o,t,e,r)=>{for(var s=r>1?void 0:r?ao(t,e):t,n=o.length-1,i;n>=0;n--)(i=o[n])&&(s=(r?i(t,e,s):i(s))||s);return r&&s&&ce(t,e,s),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const po={attribute:!0,type:String,converter:Y,reflect:!1,hasChanged:gt},bo=(o=po,t,e)=>{const{kind:r,metadata:s}=e;let n=globalThis.litPropertyMetadata.get(s);if(n===void 0&&globalThis.litPropertyMetadata.set(s,n=new Map),n.set(e.name,o),r==="accessor"){const{name:i}=e;return{set(a){const l=t.get.call(this);t.set.call(this,a),this.requestUpdate(i,l,o)},init(a){return a!==void 0&&this.C(i,void 0,o),a}}}if(r==="setter"){const{name:i}=e;return function(a){const l=this[i];t.call(this,a),this.requestUpdate(i,l,o)}}throw Error("Unsupported decorator location: "+r)};function h(o){return(t,e)=>typeof e=="object"?bo(o,t,e):((r,s,n)=>{const i=s.hasOwnProperty(n);return s.constructor.createProperty(n,i?{...r,wrapped:!0}:r),i?Object.getOwnPropertyDescriptor(s,n):void 0})(o,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function yt(o){return h({...o,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Nt=(o,t,e)=>(e.configurable=!0,e.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(o,t,e),e);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function fo(o,t){return(e,r,s)=>{const n=i=>{var a;return((a=i.renderRoot)==null?void 0:a.querySelector(o))??null};if(t){const{get:i,set:a}=typeof r=="object"?e:s??(()=>{const l=Symbol();return{get(){return this[l]},set(u){this[l]=u}}})();return Nt(e,r,{get(){let l=i.call(this);return l===void 0&&(l=n(this),(l!==null||this.hasUpdated)&&a.call(this,l)),l}})}return Nt(e,r,{get(){return n(this)}})}}var S=class extends R{constructor(){super(),Object.entries(this.constructor.dependencies).forEach(([o,t])=>{this.constructor.define(o,t)})}emit(o,t){const e=new CustomEvent(o,q({bubbles:!0,cancelable:!1,composed:!0,detail:{}},t));return this.dispatchEvent(e),e}static define(o,t=this,e={}){const r=customElements.get(o);if(!r){customElements.define(o,class extends t{},e);return}let s=" (unknown version)",n=s;"version"in t&&t.version&&(s=" v"+t.version),"version"in r&&r.version&&(n=" v"+r.version),!(s&&n&&s===n)&&console.warn(`Attempted to register <${o}>${s}, but <${o}>${n} has already been registered.`)}};S.version="2.12.0";S.dependencies={};c([h()],S.prototype,"dir",2);c([h()],S.prototype,"lang",2);var de=class extends S{constructor(){super(...arguments),this.localize=new ae(this)}render(){return H`
      <svg part="base" class="spinner" role="progressbar" aria-label=${this.localize.term("loading")}>
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `}};de.styles=ro;var T=new WeakMap,z=new WeakMap,O=new WeakMap,at=new WeakSet,Z=new WeakMap,vo=class{constructor(o,t){this.handleFormData=e=>{const r=this.options.disabled(this.host),s=this.options.name(this.host),n=this.options.value(this.host),i=this.host.tagName.toLowerCase()==="sl-button";!r&&!i&&typeof s=="string"&&s.length>0&&typeof n<"u"&&(Array.isArray(n)?n.forEach(a=>{e.formData.append(s,a.toString())}):e.formData.append(s,n.toString()))},this.handleFormSubmit=e=>{var r;const s=this.options.disabled(this.host),n=this.options.reportValidity;this.form&&!this.form.noValidate&&((r=T.get(this.form))==null||r.forEach(i=>{this.setUserInteracted(i,!0)})),this.form&&!this.form.noValidate&&!s&&!n(this.host)&&(e.preventDefault(),e.stopImmediatePropagation())},this.handleFormReset=()=>{this.options.setValue(this.host,this.options.defaultValue(this.host)),this.setUserInteracted(this.host,!1),Z.set(this.host,[])},this.handleInteraction=e=>{const r=Z.get(this.host);r.includes(e.type)||r.push(e.type),r.length===this.options.assumeInteractionOn.length&&this.setUserInteracted(this.host,!0)},this.checkFormValidity=()=>{if(this.form&&!this.form.noValidate){const e=this.form.querySelectorAll("*");for(const r of e)if(typeof r.checkValidity=="function"&&!r.checkValidity())return!1}return!0},this.reportFormValidity=()=>{if(this.form&&!this.form.noValidate){const e=this.form.querySelectorAll("*");for(const r of e)if(typeof r.reportValidity=="function"&&!r.reportValidity())return!1}return!0},(this.host=o).addController(this),this.options=q({form:e=>{const r=e.form;if(r){const n=e.getRootNode().getElementById(r);if(n)return n}return e.closest("form")},name:e=>e.name,value:e=>e.value,defaultValue:e=>e.defaultValue,disabled:e=>{var r;return(r=e.disabled)!=null?r:!1},reportValidity:e=>typeof e.reportValidity=="function"?e.reportValidity():!0,checkValidity:e=>typeof e.checkValidity=="function"?e.checkValidity():!0,setValue:(e,r)=>e.value=r,assumeInteractionOn:["sl-input"]},t)}hostConnected(){const o=this.options.form(this.host);o&&this.attachForm(o),Z.set(this.host,[]),this.options.assumeInteractionOn.forEach(t=>{this.host.addEventListener(t,this.handleInteraction)})}hostDisconnected(){this.detachForm(),Z.delete(this.host),this.options.assumeInteractionOn.forEach(o=>{this.host.removeEventListener(o,this.handleInteraction)})}hostUpdated(){const o=this.options.form(this.host);o||this.detachForm(),o&&this.form!==o&&(this.detachForm(),this.attachForm(o)),this.host.hasUpdated&&this.setValidity(this.host.validity.valid)}attachForm(o){o?(this.form=o,T.has(this.form)?T.get(this.form).add(this.host):T.set(this.form,new Set([this.host])),this.form.addEventListener("formdata",this.handleFormData),this.form.addEventListener("submit",this.handleFormSubmit),this.form.addEventListener("reset",this.handleFormReset),z.has(this.form)||(z.set(this.form,this.form.reportValidity),this.form.reportValidity=()=>this.reportFormValidity()),O.has(this.form)||(O.set(this.form,this.form.checkValidity),this.form.checkValidity=()=>this.checkFormValidity())):this.form=void 0}detachForm(){if(!this.form)return;const o=T.get(this.form);o&&(o.delete(this.host),o.size<=0&&(this.form.removeEventListener("formdata",this.handleFormData),this.form.removeEventListener("submit",this.handleFormSubmit),this.form.removeEventListener("reset",this.handleFormReset),z.has(this.form)&&(this.form.reportValidity=z.get(this.form),z.delete(this.form)),O.has(this.form)&&(this.form.checkValidity=O.get(this.form),O.delete(this.form)),this.form=void 0))}setUserInteracted(o,t){t?at.add(o):at.delete(o),o.requestUpdate()}doAction(o,t){if(this.form){const e=document.createElement("button");e.type=o,e.style.position="absolute",e.style.width="0",e.style.height="0",e.style.clipPath="inset(50%)",e.style.overflow="hidden",e.style.whiteSpace="nowrap",t&&(e.name=t.name,e.value=t.value,["formaction","formenctype","formmethod","formnovalidate","formtarget"].forEach(r=>{t.hasAttribute(r)&&e.setAttribute(r,t.getAttribute(r))})),this.form.append(e),e.click(),e.remove()}}getForm(){var o;return(o=this.form)!=null?o:null}reset(o){this.doAction("reset",o)}submit(o){this.doAction("submit",o)}setValidity(o){const t=this.host,e=!!at.has(t),r=!!t.required;t.toggleAttribute("data-required",r),t.toggleAttribute("data-optional",!r),t.toggleAttribute("data-invalid",!o),t.toggleAttribute("data-valid",o),t.toggleAttribute("data-user-invalid",!o&&e),t.toggleAttribute("data-user-valid",o&&e)}updateValidity(){const o=this.host;this.setValidity(o.validity.valid)}emitInvalidEvent(o){const t=new CustomEvent("sl-invalid",{bubbles:!1,composed:!1,cancelable:!0,detail:{}});o||t.preventDefault(),this.host.dispatchEvent(t)||o==null||o.preventDefault()}},_t=Object.freeze({badInput:!1,customError:!1,patternMismatch:!1,rangeOverflow:!1,rangeUnderflow:!1,stepMismatch:!1,tooLong:!1,tooShort:!1,typeMismatch:!1,valid:!0,valueMissing:!1});Object.freeze(ue(q({},_t),{valid:!1,valueMissing:!0}));Object.freeze(ue(q({},_t),{valid:!1,customError:!0}));var go=tt`
  ${mt}

  :host {
    display: inline-block;
    position: relative;
    width: auto;
    cursor: pointer;
  }

  .button {
    display: inline-flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    border-style: solid;
    border-width: var(--sl-input-border-width);
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-font-weight-semibold);
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    padding: 0;
    transition:
      var(--sl-transition-x-fast) background-color,
      var(--sl-transition-x-fast) color,
      var(--sl-transition-x-fast) border,
      var(--sl-transition-x-fast) box-shadow;
    cursor: inherit;
  }

  .button::-moz-focus-inner {
    border: 0;
  }

  .button:focus {
    outline: none;
  }

  .button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* When disabled, prevent mouse events from bubbling up from children */
  .button--disabled * {
    pointer-events: none;
  }

  .button__prefix,
  .button__suffix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .button__label {
    display: inline-block;
  }

  .button__label::slotted(sl-icon) {
    vertical-align: -2px;
  }

  /*
   * Standard buttons
   */

  /* Default */
  .button--standard.button--default {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-neutral-300);
    color: var(--sl-color-neutral-700);
  }

  .button--standard.button--default:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-300);
    color: var(--sl-color-primary-700);
  }

  .button--standard.button--default:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-100);
    border-color: var(--sl-color-primary-400);
    color: var(--sl-color-primary-700);
  }

  /* Primary */
  .button--standard.button--primary {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--standard.button--success {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:hover:not(.button--disabled) {
    background-color: var(--sl-color-success-500);
    border-color: var(--sl-color-success-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:active:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--standard.button--neutral {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:hover:not(.button--disabled) {
    background-color: var(--sl-color-neutral-500);
    border-color: var(--sl-color-neutral-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:active:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--standard.button--warning {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }
  .button--standard.button--warning:hover:not(.button--disabled) {
    background-color: var(--sl-color-warning-500);
    border-color: var(--sl-color-warning-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--warning:active:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--standard.button--danger {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:hover:not(.button--disabled) {
    background-color: var(--sl-color-danger-500);
    border-color: var(--sl-color-danger-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:active:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  /*
   * Outline buttons
   */

  .button--outline {
    background: none;
    border: solid 1px;
  }

  /* Default */
  .button--outline.button--default {
    border-color: var(--sl-color-neutral-300);
    color: var(--sl-color-neutral-700);
  }

  .button--outline.button--default:hover:not(.button--disabled),
  .button--outline.button--default.button--checked:not(.button--disabled) {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--default:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Primary */
  .button--outline.button--primary {
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-primary-600);
  }

  .button--outline.button--primary:hover:not(.button--disabled),
  .button--outline.button--primary.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--primary:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--outline.button--success {
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-success-600);
  }

  .button--outline.button--success:hover:not(.button--disabled),
  .button--outline.button--success.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--success:active:not(.button--disabled) {
    border-color: var(--sl-color-success-700);
    background-color: var(--sl-color-success-700);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--outline.button--neutral {
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-600);
  }

  .button--outline.button--neutral:hover:not(.button--disabled),
  .button--outline.button--neutral.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--neutral:active:not(.button--disabled) {
    border-color: var(--sl-color-neutral-700);
    background-color: var(--sl-color-neutral-700);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--outline.button--warning {
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-warning-600);
  }

  .button--outline.button--warning:hover:not(.button--disabled),
  .button--outline.button--warning.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--warning:active:not(.button--disabled) {
    border-color: var(--sl-color-warning-700);
    background-color: var(--sl-color-warning-700);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--outline.button--danger {
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-danger-600);
  }

  .button--outline.button--danger:hover:not(.button--disabled),
  .button--outline.button--danger.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--danger:active:not(.button--disabled) {
    border-color: var(--sl-color-danger-700);
    background-color: var(--sl-color-danger-700);
    color: var(--sl-color-neutral-0);
  }

  @media (forced-colors: active) {
    .button.button--outline.button--checked:not(.button--disabled) {
      outline: solid 2px transparent;
    }
  }

  /*
   * Text buttons
   */

  .button--text {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-600);
  }

  .button--text:hover:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:focus-visible:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:active:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-700);
  }

  /*
   * Size modifiers
   */

  .button--small {
    height: auto;
    min-height: var(--sl-input-height-small);
    font-size: var(--sl-button-font-size-small);
    line-height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-small);
  }

  .button--medium {
    height: auto;
    min-height: var(--sl-input-height-medium);
    font-size: var(--sl-button-font-size-medium);
    line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-medium);
  }

  .button--large {
    height: auto;
    min-height: var(--sl-input-height-large);
    font-size: var(--sl-button-font-size-large);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
  }

  /*
   * Pill modifier
   */

  .button--pill.button--small {
    border-radius: var(--sl-input-height-small);
  }

  .button--pill.button--medium {
    border-radius: var(--sl-input-height-medium);
  }

  .button--pill.button--large {
    border-radius: var(--sl-input-height-large);
  }

  /*
   * Circle modifier
   */

  .button--circle {
    padding-left: 0;
    padding-right: 0;
  }

  .button--circle.button--small {
    width: var(--sl-input-height-small);
    border-radius: 50%;
  }

  .button--circle.button--medium {
    width: var(--sl-input-height-medium);
    border-radius: 50%;
  }

  .button--circle.button--large {
    width: var(--sl-input-height-large);
    border-radius: 50%;
  }

  .button--circle .button__prefix,
  .button--circle .button__suffix,
  .button--circle .button__caret {
    display: none;
  }

  /*
   * Caret modifier
   */

  .button--caret .button__suffix {
    display: none;
  }

  .button--caret .button__caret {
    height: auto;
  }

  /*
   * Loading modifier
   */

  .button--loading {
    position: relative;
    cursor: wait;
  }

  .button--loading .button__prefix,
  .button--loading .button__label,
  .button--loading .button__suffix,
  .button--loading .button__caret {
    visibility: hidden;
  }

  .button--loading sl-spinner {
    --indicator-color: currentColor;
    position: absolute;
    font-size: 1em;
    height: 1em;
    width: 1em;
    top: calc(50% - 0.5em);
    left: calc(50% - 0.5em);
  }

  /*
   * Badges
   */

  .button ::slotted(sl-badge) {
    position: absolute;
    top: 0;
    right: 0;
    translate: 50% -50%;
    pointer-events: none;
  }

  .button--rtl ::slotted(sl-badge) {
    right: auto;
    left: 0;
    translate: -50% -50%;
  }

  /*
   * Button spacing
   */

  .button--has-label.button--small .button__label {
    padding: 0 var(--sl-spacing-small);
  }

  .button--has-label.button--medium .button__label {
    padding: 0 var(--sl-spacing-medium);
  }

  .button--has-label.button--large .button__label {
    padding: 0 var(--sl-spacing-large);
  }

  .button--has-prefix.button--small {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--small .button__label {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--medium {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--medium .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-suffix.button--small,
  .button--caret.button--small {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--small .button__label,
  .button--caret.button--small .button__label {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--medium,
  .button--caret.button--medium {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--medium .button__label,
  .button--caret.button--medium .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large,
  .button--caret.button--large {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large .button__label,
  .button--caret.button--large .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  /*
   * Button groups support a variety of button types (e.g. buttons with tooltips, buttons as dropdown triggers, etc.).
   * This means buttons aren't always direct descendants of the button group, thus we can't target them with the
   * ::slotted selector. To work around this, the button group component does some magic to add these special classes to
   * buttons and we style them here instead.
   */

  :host(.sl-button-group__button--first:not(.sl-button-group__button--last)) .button {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :host(.sl-button-group__button--inner) .button {
    border-radius: 0;
  }

  :host(.sl-button-group__button--last:not(.sl-button-group__button--first)) .button {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /* All except the first */
  :host(.sl-button-group__button:not(.sl-button-group__button--first)) {
    margin-inline-start: calc(-1 * var(--sl-input-border-width));
  }

  /* Add a visual separator between solid buttons */
  :host(
      .sl-button-group__button:not(
          .sl-button-group__button--first,
          .sl-button-group__button--radio,
          [variant='default']
        ):not(:hover)
    )
    .button:after {
    content: '';
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    bottom: 0;
    border-left: solid 1px rgb(128 128 128 / 33%);
    mix-blend-mode: multiply;
  }

  /* Bump hovered, focused, and checked buttons up so their focus ring isn't clipped */
  :host(.sl-button-group__button--hover) {
    z-index: 1;
  }

  /* Focus and checked are always on top */
  :host(.sl-button-group__button--focus),
  :host(.sl-button-group__button[checked]) {
    z-index: 2;
  }
`,mo=class{constructor(o,...t){this.slotNames=[],this.handleSlotChange=e=>{const r=e.target;(this.slotNames.includes("[default]")&&!r.name||r.name&&this.slotNames.includes(r.name))&&this.host.requestUpdate()},(this.host=o).addController(this),this.slotNames=t}hasDefaultSlot(){return[...this.host.childNodes].some(o=>{if(o.nodeType===o.TEXT_NODE&&o.textContent.trim()!=="")return!0;if(o.nodeType===o.ELEMENT_NODE){const t=o;if(t.tagName.toLowerCase()==="sl-visually-hidden")return!1;if(!t.hasAttribute("slot"))return!0}return!1})}hasNamedSlot(o){return this.host.querySelector(`:scope > [slot="${o}"]`)!==null}test(o){return o==="[default]"?this.hasDefaultSlot():this.hasNamedSlot(o)}hostConnected(){this.host.shadowRoot.addEventListener("slotchange",this.handleSlotChange)}hostDisconnected(){this.host.shadowRoot.removeEventListener("slotchange",this.handleSlotChange)}},yo=tt`
  ${mt}

  :host {
    display: inline-block;
    width: 1em;
    height: 1em;
    box-sizing: content-box !important;
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`,pt="";function Vt(o){pt=o}function _o(o=""){if(!pt){const t=[...document.getElementsByTagName("script")],e=t.find(r=>r.hasAttribute("data-shoelace"));if(e)Vt(e.getAttribute("data-shoelace"));else{const r=t.find(n=>/shoelace(\.min)?\.js($|\?)/.test(n.src)||/shoelace-autoloader(\.min)?\.js($|\?)/.test(n.src));let s="";r&&(s=r.getAttribute("src")),Vt(s.split("/").slice(0,-1).join("/"))}}return pt.replace(/\/$/,"")+(o?`/${o.replace(/^\//,"")}`:"")}var $o={name:"default",resolver:o=>_o(`assets/icons/${o}.svg`)},wo=$o,Ut={caret:`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,check:`
    <svg part="checked-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor">
          <g transform="translate(3.428571, 3.428571)">
            <path d="M0,5.71428571 L3.42857143,9.14285714"></path>
            <path d="M9.14285714,0 L3.42857143,9.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,"chevron-down":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,"chevron-left":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
    </svg>
  `,"chevron-right":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,copy:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
    </svg>
  `,eye:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  `,"eye-slash":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  `,eyedropper:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eyedropper" viewBox="0 0 16 16">
      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
    </svg>
  `,"grip-vertical":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16">
      <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
    </svg>
  `,indeterminate:`
    <svg part="indeterminate-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor" stroke-width="2">
          <g transform="translate(2.285714, 6.857143)">
            <path d="M10.2857143,1.14285714 L1.14285714,1.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,"person-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  `,"play-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
    </svg>
  `,"pause-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
    </svg>
  `,radio:`
    <svg part="checked-icon" class="radio__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill="currentColor">
          <circle cx="8" cy="8" r="3.42857143"></circle>
        </g>
      </g>
    </svg>
  `,"star-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
  `,"x-lg":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  `,"x-circle-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
    </svg>
  `},Ao={name:"system",resolver:o=>o in Ut?`data:image/svg+xml,${encodeURIComponent(Ut[o])}`:""},Co=Ao,Eo=[wo,Co],bt=[];function xo(o){bt.push(o)}function So(o){bt=bt.filter(t=>t!==o)}function Rt(o){return Eo.find(t=>t.name===o)}function $t(o,t){const e=q({waitUntilFirstUpdate:!1},t);return(r,s)=>{const{update:n}=r,i=Array.isArray(o)?o:[o];r.update=function(a){i.forEach(l=>{const u=l;if(a.has(u)){const b=a.get(u),d=this[u];b!==d&&(!e.waitUntilFirstUpdate||this.hasUpdated)&&this[s](b,d)}}),n.call(this,a)}}}var N=Symbol(),K=Symbol(),ct,ut=new Map,y=class extends S{constructor(){super(...arguments),this.initialRender=!1,this.svg=null,this.label="",this.library="default"}async resolveIcon(o,t){var e;let r;if(t!=null&&t.spriteSheet)return H`<svg part="svg">
        <use part="use" href="${o}"></use>
      </svg>`;try{if(r=await fetch(o,{mode:"cors"}),!r.ok)return r.status===410?N:K}catch{return K}try{const s=document.createElement("div");s.innerHTML=await r.text();const n=s.firstElementChild;if(((e=n==null?void 0:n.tagName)==null?void 0:e.toLowerCase())!=="svg")return N;ct||(ct=new DOMParser);const a=ct.parseFromString(n.outerHTML,"text/html").body.querySelector("svg");return a?(a.part.add("svg"),document.adoptNode(a)):N}catch{return N}}connectedCallback(){super.connectedCallback(),xo(this)}firstUpdated(){this.initialRender=!0,this.setIcon()}disconnectedCallback(){super.disconnectedCallback(),So(this)}getIconSource(){const o=Rt(this.library);return this.name&&o?{url:o.resolver(this.name),fromLibrary:!0}:{url:this.src,fromLibrary:!1}}handleLabelChange(){typeof this.label=="string"&&this.label.length>0?(this.setAttribute("role","img"),this.setAttribute("aria-label",this.label),this.removeAttribute("aria-hidden")):(this.removeAttribute("role"),this.removeAttribute("aria-label"),this.setAttribute("aria-hidden","true"))}async setIcon(){var o;const{url:t,fromLibrary:e}=this.getIconSource(),r=e?Rt(this.library):void 0;if(!t){this.svg=null;return}let s=ut.get(t);if(s||(s=this.resolveIcon(t,r),ut.set(t,s)),!this.initialRender)return;const n=await s;if(n===K&&ut.delete(t),t===this.getIconSource().url){if(Te(n)){this.svg=n;return}switch(n){case K:case N:this.svg=null,this.emit("sl-error");break;default:this.svg=n.cloneNode(!0),(o=r==null?void 0:r.mutator)==null||o.call(r,this.svg),this.emit("sl-load")}}}render(){return this.svg}};y.styles=yo;c([yt()],y.prototype,"svg",2);c([h({reflect:!0})],y.prototype,"name",2);c([h()],y.prototype,"src",2);c([h()],y.prototype,"label",2);c([h({reflect:!0})],y.prototype,"library",2);c([$t("label")],y.prototype,"handleLabelChange",1);c([$t(["name","src","library"])],y.prototype,"setIcon",1);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ko=Yt(class extends Gt{constructor(o){var t;if(super(o),o.type!==Jt.ATTRIBUTE||o.name!=="class"||((t=o.strings)==null?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(o){return" "+Object.keys(o).filter(t=>o[t]).join(" ")+" "}update(o,[t]){var r,s;if(this.it===void 0){this.it=new Set,o.strings!==void 0&&(this.st=new Set(o.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(const n in t)t[n]&&!((r=this.st)!=null&&r.has(n))&&this.it.add(n);return this.render(t)}const e=o.element.classList;for(const n of this.it)n in t||(e.remove(n),this.it.delete(n));for(const n in t){const i=!!t[n];i===this.it.has(n)||(s=this.st)!=null&&s.has(n)||(i?(e.add(n),this.it.add(n)):(e.remove(n),this.it.delete(n)))}return m}});/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const he=Symbol.for(""),Po=o=>{if((o==null?void 0:o.r)===he)return o==null?void 0:o._$litStatic$},Bt=(o,...t)=>({_$litStatic$:t.reduce((e,r,s)=>e+(n=>{if(n._$litStatic$!==void 0)return n._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${n}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`)})(r)+o[s+1],o[0]),r:he}),It=new Map,Mo=o=>(t,...e)=>{const r=e.length;let s,n;const i=[],a=[];let l,u=0,b=!1;for(;u<r;){for(l=t[u];u<r&&(n=e[u],(s=Po(n))!==void 0);)l+=s+t[++u],b=!0;u!==r&&a.push(n),i.push(l),u++}if(u===r&&i.push(t[r]),b){const d=i.join("$$lit$$");(t=It.get(d))===void 0&&(i.raw=i,It.set(d,t=i)),e=a}return o(t,...e)},dt=Mo(H);var p=class extends S{constructor(){super(...arguments),this.formControlController=new vo(this,{assumeInteractionOn:["click"]}),this.hasSlotController=new mo(this,"[default]","prefix","suffix"),this.localize=new ae(this),this.hasFocus=!1,this.invalid=!1,this.title="",this.variant="default",this.size="medium",this.caret=!1,this.disabled=!1,this.loading=!1,this.outline=!1,this.pill=!1,this.circle=!1,this.type="button",this.name="",this.value="",this.href="",this.rel="noreferrer noopener"}get validity(){return this.isButton()?this.button.validity:_t}get validationMessage(){return this.isButton()?this.button.validationMessage:""}firstUpdated(){this.isButton()&&this.formControlController.updateValidity()}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleClick(){this.type==="submit"&&this.formControlController.submit(this),this.type==="reset"&&this.formControlController.reset(this)}handleInvalid(o){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(o)}isButton(){return!this.href}isLink(){return!!this.href}handleDisabledChange(){this.isButton()&&this.formControlController.setValidity(this.disabled)}click(){this.button.click()}focus(o){this.button.focus(o)}blur(){this.button.blur()}checkValidity(){return this.isButton()?this.button.checkValidity():!0}getForm(){return this.formControlController.getForm()}reportValidity(){return this.isButton()?this.button.reportValidity():!0}setCustomValidity(o){this.isButton()&&(this.button.setCustomValidity(o),this.formControlController.updateValidity())}render(){const o=this.isLink(),t=o?Bt`a`:Bt`button`;return dt`
      <${t}
        part="base"
        class=${ko({button:!0,"button--default":this.variant==="default","button--primary":this.variant==="primary","button--success":this.variant==="success","button--neutral":this.variant==="neutral","button--warning":this.variant==="warning","button--danger":this.variant==="danger","button--text":this.variant==="text","button--small":this.size==="small","button--medium":this.size==="medium","button--large":this.size==="large","button--caret":this.caret,"button--circle":this.circle,"button--disabled":this.disabled,"button--focused":this.hasFocus,"button--loading":this.loading,"button--standard":!this.outline,"button--outline":this.outline,"button--pill":this.pill,"button--rtl":this.localize.dir()==="rtl","button--has-label":this.hasSlotController.test("[default]"),"button--has-prefix":this.hasSlotController.test("prefix"),"button--has-suffix":this.hasSlotController.test("suffix")})}
        ?disabled=${g(o?void 0:this.disabled)}
        type=${g(o?void 0:this.type)}
        title=${this.title}
        name=${g(o?void 0:this.name)}
        value=${g(o?void 0:this.value)}
        href=${g(o?this.href:void 0)}
        target=${g(o?this.target:void 0)}
        download=${g(o?this.download:void 0)}
        rel=${g(o?this.rel:void 0)}
        role=${g(o?void 0:"button")}
        aria-disabled=${this.disabled?"true":"false"}
        tabindex=${this.disabled?"-1":"0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @invalid=${this.isButton()?this.handleInvalid:null}
        @click=${this.handleClick}
      >
        <slot name="prefix" part="prefix" class="button__prefix"></slot>
        <slot part="label" class="button__label"></slot>
        <slot name="suffix" part="suffix" class="button__suffix"></slot>
        ${this.caret?dt` <sl-icon part="caret" class="button__caret" library="system" name="caret"></sl-icon> `:""}
        ${this.loading?dt`<sl-spinner part="spinner"></sl-spinner>`:""}
      </${t}>
    `}};p.styles=go;p.dependencies={"sl-icon":y,"sl-spinner":de};c([fo(".button")],p.prototype,"button",2);c([yt()],p.prototype,"hasFocus",2);c([yt()],p.prototype,"invalid",2);c([h()],p.prototype,"title",2);c([h({reflect:!0})],p.prototype,"variant",2);c([h({reflect:!0})],p.prototype,"size",2);c([h({type:Boolean,reflect:!0})],p.prototype,"caret",2);c([h({type:Boolean,reflect:!0})],p.prototype,"disabled",2);c([h({type:Boolean,reflect:!0})],p.prototype,"loading",2);c([h({type:Boolean,reflect:!0})],p.prototype,"outline",2);c([h({type:Boolean,reflect:!0})],p.prototype,"pill",2);c([h({type:Boolean,reflect:!0})],p.prototype,"circle",2);c([h()],p.prototype,"type",2);c([h()],p.prototype,"name",2);c([h()],p.prototype,"value",2);c([h()],p.prototype,"href",2);c([h()],p.prototype,"target",2);c([h()],p.prototype,"rel",2);c([h()],p.prototype,"download",2);c([h()],p.prototype,"form",2);c([h({attribute:"formaction"})],p.prototype,"formAction",2);c([h({attribute:"formenctype"})],p.prototype,"formEnctype",2);c([h({attribute:"formmethod"})],p.prototype,"formMethod",2);c([h({attribute:"formnovalidate",type:Boolean})],p.prototype,"formNoValidate",2);c([h({attribute:"formtarget"})],p.prototype,"formTarget",2);c([$t("disabled",{waitUntilFirstUpdate:!0})],p.prototype,"handleDisabledChange",1);p.define("sl-button");const Lo="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='currentColor'%20class='bi%20bi-gear'%20viewBox='0%200%2016%2016'%3e%3cpath%20d='M8%204.754a3.246%203.246%200%201%200%200%206.492%203.246%203.246%200%200%200%200-6.492zM5.754%208a2.246%202.246%200%201%201%204.492%200%202.246%202.246%200%200%201-4.492%200z'/%3e%3cpath%20d='M9.796%201.343c-.527-1.79-3.065-1.79-3.592%200l-.094.319a.873.873%200%200%201-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54%202.541l.159.292a.873.873%200%200%201-.52%201.255l-.319.094c-1.79.527-1.79%203.065%200%203.592l.319.094a.873.873%200%200%201%20.52%201.255l-.16.292c-.892%201.64.901%203.434%202.541%202.54l.292-.159a.873.873%200%200%201%201.255.52l.094.319c.527%201.79%203.065%201.79%203.592%200l.094-.319a.873.873%200%200%201%201.255-.52l.292.16c1.64.893%203.434-.902%202.54-2.541l-.159-.292a.873.873%200%200%201%20.52-1.255l.319-.094c1.79-.527%201.79-3.065%200-3.592l-.319-.094a.873.873%200%200%201-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873%200%200%201-1.255-.52l-.094-.319zm-2.633.283c.246-.835%201.428-.835%201.674%200l.094.319a1.873%201.873%200%200%200%202.693%201.115l.291-.16c.764-.415%201.6.42%201.184%201.185l-.159.292a1.873%201.873%200%200%200%201.116%202.692l.318.094c.835.246.835%201.428%200%201.674l-.319.094a1.873%201.873%200%200%200-1.115%202.693l.16.291c.415.764-.42%201.6-1.185%201.184l-.291-.159a1.873%201.873%200%200%200-2.693%201.116l-.094.318c-.246.835-1.428.835-1.674%200l-.094-.319a1.873%201.873%200%200%200-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873%201.873%200%200%200%201.945%208.93l-.319-.094c-.835-.246-.835-1.428%200-1.674l.319-.094A1.873%201.873%200%200%200%203.06%204.377l-.16-.292c-.415-.764.42-1.6%201.185-1.184l.292.159a1.873%201.873%200%200%200%202.692-1.115l.094-.319z'/%3e%3c/svg%3e";function To(){return()=>H`<div id="app">
      <sl-button variant="default" size="small" circle>
        <sl-icon src=${Lo} label="Settings"></sl-icon>
      </sl-button>
    </div>`}Le(()=>H`${oo(To)}`,{renderContainer:"body"});window.matchMedia&&(window.matchMedia("(prefers-color-scheme: dark)").matches&&document.documentElement.classList.add("sl-theme-dark"),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{window.matchMedia("(prefers-color-scheme: dark)").matches?document.documentElement.classList.add("sl-theme-dark"):document.documentElement.classList.remove("sl-theme-dark")}));
