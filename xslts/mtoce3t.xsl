<!--?xml version="1.0"?-->
<xsl:stylesheet version="1.0"
                xmlns="http://www.w3.org/1999/xhtml"
                exclude-result-prefixes="ncx xsl"
                xmlns:ncx="http://www.daisy.org/z3986/2005/ncx/"
                xmlns:epub="http://www.idpf.org/2007/ops"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" indent="yes" encoding="UTF-8"/>
<xsl:param name="contents-str">Contents</xsl:param>

  <xsl:template match="ncx:ncx">
    <xsl:call-template name="html-head"/>
    <select id="tocselect">
      <xsl:apply-templates/>
    </select>
  </xsl:template>

  <xsl:template match="ncx:navMap">
        <!--h1><xsl:value-of select="$contents-str"/></h1-->
          <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="ncx:navPoint">
    <option style="text-indent:{16*count(ancestor::*)}px">
        <xsl:attribute name="id">
            <xsl:value-of select="@playOrder"/>
        </xsl:attribute>
            <xsl:value-of select="ncx:navLabel"/>
    </option>
        <xsl:apply-templates select="ncx:navPoint"/>
  </xsl:template>

  <xsl:template match="ncx:navLabel|
                       ncx:text">
        <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="ncx:head|
                       ncx:docAuthor|
                       ncx:docTitle"/>
  <xsl:template match="ncx:head/text()|
                       ncx:docAuthor/text()|
                       ncx:docTitle/text()|
                       ncx:navLabel/text()"/>

  <xsl:template match="*">
    <xsl:message terminate="yes">ERROR: <xsl:value-of select="name(.)"/> not matched!
    </xsl:message>
  </xsl:template>

  <xsl:template name="html-head">
      <h1><xsl:apply-templates select="/ncx:ncx/ncx:docTitle/ncx:text"/></h1>
  </xsl:template>

</xsl:stylesheet>
