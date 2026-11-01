export const labels={wood:'Bois',stone:'Pierre',ore:'Minerai de fer',fiber:'Fibres',berries:'Baies',meat:'Viande crue',hide:'Peaux',cooked:'Viande cuite'};
export const recipes={axe:{name:'Hache en pierre',cost:{wood:4,stone:3,fiber:2}},pick:{name:'Pioche en pierre',cost:{wood:5,stone:5,fiber:3}},spear:{name:'Lance de chasse',cost:{wood:5,stone:2,fiber:3}},fire:{name:'Feu de camp',cost:{wood:8,stone:5}}};
export class Survival{
 constructor(){this.bag=Object.fromEntries(Object.keys(labels).map(k=>[k,0]));this.tools=['hand'];this.equipped='hand';this.health=100;this.stamina=100;this.hunger=100;this.thirst=100;this.depleted={};this.fires=[];this.time=0;}
 get weight(){return Object.entries(this.bag).reduce((s,[k,v])=>s+v*({wood:.4,stone:.6,ore:.8,fiber:.05}[k]||.2),0)}
 add(k,n){this.bag[k]+=n}
 can(cost){return Object.entries(cost).every(([k,v])=>this.bag[k]>=v)}
 pay(cost){if(!this.can(cost))return false;for(const [k,v]of Object.entries(cost))this.bag[k]-=v;return true}
 craft(k){const r=recipes[k];if(!r||this.tools.includes(k)||!this.pay(r.cost))return false;if(k!=='fire'){this.tools.push(k);this.equipped=k}return true}
 harvest(n){if(n.amount<=0)return {error:'Ressource épuisée'};if(n.kind==='ore'&&this.equipped!=='pick')return {error:'Une pioche est nécessaire'};if(this.stamina<5)return {error:'Reprenez votre souffle'};this.stamina-=5;const kind=n.kind;const q=Math.min(n.amount,kind==='wood'&&this.equipped==='axe'||kind==='stone'&&this.equipped==='pick'?3:kind==='bush'?2:1);n.amount-=q;this.depleted[n.id]=n.amount;if(kind==='bush'){this.add('berries',q);this.add('fiber',q+1);return {text:`+${q} baies · +${q+1} fibres`}}this.add(kind,q);return {text:`+${q} ${labels[kind].toLowerCase()}`}}
 tick(dt,sprint){this.time+=dt;this.stamina=Math.max(0,Math.min(100,this.stamina+dt*(sprint?-14:10)));this.hunger=Math.max(0,this.hunger-dt*.035);this.thirst=Math.max(0,this.thirst-dt*.05);if(!this.hunger||!this.thirst)this.health=Math.max(0,this.health-dt*.4)}
 eat(){const k=this.bag.cooked?'cooked':this.bag.berries?'berries':null;if(!k)return false;this.bag[k]--;this.hunger=Math.min(100,this.hunger+(k==='cooked'?35:12));this.health=Math.min(100,this.health+3);return true}
 snapshot(){return JSON.parse(JSON.stringify(this))}
 restore(data){if(!data||!data.bag)return false;for(const k of Object.keys(labels))this.bag[k]=Math.max(0,Math.min(9999,Number(data.bag[k])||0));this.tools=['hand',...['axe','pick','spear'].filter(k=>data.tools?.includes(k))];this.equipped=this.tools.includes(data.equipped)?data.equipped:'hand';for(const k of ['health','stamina','hunger','thirst'])this[k]=Math.max(0,Math.min(100,Number(data[k])||0));this.depleted=data.depleted||{};this.fires=Array.isArray(data.fires)?data.fires.slice(0,20):[];this.time=Number(data.time)||0;return true}
}
