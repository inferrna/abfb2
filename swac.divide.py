import swacc
for lang in swacc.var['langs'].keys():
    f = open('www/scripts/swaclangs/'+lang+'.js', 'w')
    f.write('''self.lang = '''+str(swacc.var['langs'][lang])+''';\n
             self.onmessage = function(event){
                self.postMessage(self.lang[event.data]);
             };''')
    f.close()
