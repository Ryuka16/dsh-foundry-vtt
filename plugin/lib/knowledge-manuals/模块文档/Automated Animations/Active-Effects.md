# **Active Effect Animations**  
  
  - Animations configured from the Global Automatic Recognition menu Active Effects Tab, or those configured directly on an Active Effect  
    
Animations for Active Effects are tied directly into the Foundry Active Effects system. These animations are for Source (originating) tokens only, and do not deal with Targets.  
  
When an Active Effect is applied to a token, if the Active Effect ``label`` matches a Global entry, or if an animation is defined on the Active Effect itself, the animation will play on that token. If the animation is set to ``Persistent``, it will automatically remove the Animation when the Active Effect is removed.  
  
In the example below, Frightened is configured to be a Persistent effect, with **WAIT** set at -250, followed by a Secondary effect. Notice when the Active Effect is removed, then the Secondary animation plays due to choosing **WAIT**  
  
<p align="center">
<video width=400 autoplay="autoplay" loop src="videos/ActiveEffect.mp4"></video>
</p>

<p align="center">
NOTE: The PF2e System Rules Elements can be configured as Active Effects for the same utilization
</p>
