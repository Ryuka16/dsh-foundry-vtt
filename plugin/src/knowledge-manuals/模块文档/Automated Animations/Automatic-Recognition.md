## Automatic Recognition  

# **Name Matching**  
Item Names for each section in the Global Automatic Recognition menu are matched on Item use to the closest match.  
* Sword will match to Longsword, Shortsword, etc.
* At runtime, the name search is sorted from Longest to Shortest. So a section named Greatsword will match to Greatsword, Greatsword +1, etc, and a section named Sword will match to anything else with Sword in the name.  
  * The name comparison feature uses an "includes()" method to compare against the item name
* You should not put a name in multiple Menus. For example, if you have a Dagger entry in the Melee and Range menu, it will only be used from the Melee menu.  