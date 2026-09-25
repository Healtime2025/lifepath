import type { MetadataRoute } from 'next';
export default function manifest():MetadataRoute.Manifest{return {name:'LifePath',short_name:'LifePath',description:'Every learner has a path.',start_url:'/',display:'standalone',background_color:'#f7f8fc',theme_color:'#3659e3',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]}}
